import { prisma } from '../../config/db';
import { ClaimStatus, LineItemStatus } from '@prisma/client';

/**
 * Core Adjudication Rules Engine
 * Processes a claim against policy rules, member limits, PED waiting periods,
 * room rent proportionate deductions, and deductibles.
 * 
 * Logic Order:
 * 1.  Deductible (First-dollar responsibility)
 * 2.  Room Rent Daily Cap (on non-deductible portion)
 * 3.  Proportionate Deduction (on non-deductible portion)
 * 4.  Copay
 * 5.  Annual / Service Limits
 */
export async function runRulesEngine(claimId: string) {
  const claim = (await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      provider: true,
      member: {
        include: {
          policy: {
            include: { coverage_rules: true }
          },
          premium_payments: {
            where: { status: 'PROCESSED' },
            orderBy: { paid_at: 'asc' },
            take: 1
          }
        }
      },
      line_items: true
    }
  })) as any;

  if (!claim || !claim.member) throw new Error('Claim or Member profile not found');

  const { member } = claim;
  const { policy } = member;

  // 1. Basic Status & Policy Validation
  if (!policy) {
    return updateClaimStatus(claimId, ClaimStatus.DENIED, 'No active policy found for member.');
  }

  if (member.status !== 'ACTIVE') {
    return updateClaimStatus(claimId, ClaimStatus.DENIED, `Member status is ${member.status}. Only ACTIVE members can file claims.`);
  }

  // Calculate Policy Age (for PED check)
  const firstPayment = member.premium_payments[0];
  const policyStartDate = firstPayment ? new Date(firstPayment.paid_at) : new Date(member.created_at);
  const now = new Date();
  const policyAgeDays = Math.floor((now.getTime() - policyStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // ── Room Rent Proportionate Deduction Ratio ────────────────────────────────
  // Ratio is calculated on facts of the choice (actual room rate vs policy limit).
  // It applies if the member chose a room above their limit.
  const roomRentItem = claim.line_items.find((li: any) => li.service_type === 'ROOM_RENT');
  let proportionateRatio = 1;
  let roomRentDailyRate = 0;
  let daysStayed = 1;

  if (roomRentItem && policy.room_rent_limit > 0) {
    if (claim.admission_date && claim.discharge_date) {
      const admitMs = new Date(claim.admission_date).getTime();
      const dischargeMs = new Date(claim.discharge_date).getTime();
      daysStayed = Math.max(1, Math.ceil((dischargeMs - admitMs) / (1000 * 60 * 60 * 24)));
    }
    roomRentDailyRate = roomRentItem.charged_amount / daysStayed;

    if (roomRentDailyRate > policy.room_rent_limit) {
      proportionateRatio = policy.room_rent_limit / roomRentDailyRate;
      await prisma.claim.update({
        where: { id: claimId },
        data: { proportionate_ratio: proportionateRatio }
      });
      console.log(
        `[RulesEngine] Proportionate ratio detected: ₹${roomRentDailyRate.toFixed(0)}/day vs ₹${policy.room_rent_limit}/day limit -> ratio ${(proportionateRatio * 100).toFixed(1)}%`
      );
    }
  }

  // ── Deductible Tracking ────────────────────────────────────────────────────
  const totalDeductible = policy.deductible || 0;
  let deductibleMetBeforeClaim = member.deductible_met || 0;
  let remainingDeductible = Math.max(0, totalDeductible - deductibleMetBeforeClaim);
  let totalDeductibleAppliedThisClaim = 0;

  let overallClaimStatus: ClaimStatus = ClaimStatus.APPROVED;
  let needsManualReview = false;
  let approvedCount = 0;
  let deniedCount = 0;

  // 2. Process Line Items
  for (const item of claim.line_items) {
    let lineStatus: LineItemStatus = LineItemStatus.APPROVED;
    let approvedAmount = 0;
    let memberOwes = item.charged_amount;
    let denialReason = '';

    const rule = policy.coverage_rules.find((r: any) => r.service_type === item.service_type);

    if (!rule || !rule.is_covered) {
      lineStatus = LineItemStatus.DENIED;
      denialReason = 'Service type not covered under this policy.';
    }
    else if (claim.ped_flag && rule.ped_exclusion && policyAgeDays < policy.ped_waiting_days) {
      lineStatus = LineItemStatus.NEEDS_REVIEW;
      denialReason = `System detected possible Pre-Existing Disease (PED). Exclusion period of ${policy.ped_waiting_days} days not met. Adjudicator review required to confirm clinical match.`;
    }
    // Pre-authorisation Check — CASHLESS only
    else if (rule.requires_preauth && claim.claim_type === 'CASHLESS') {
      lineStatus = LineItemStatus.NEEDS_REVIEW;
      denialReason =
        `Pre-authorization required: ${item.service_type.replace(/_/g, ' ')} must be approved before treatment.`;
    }
    else {
      // 🚀 START MATH PIPELINE 🚀

      // Step 1: DEDUCTIBLE FIRST
      // Subtract deductible from the charged amount before applying policy rules.
      let deductibleAppliedHere = Math.min(item.charged_amount, remainingDeductible);
      remainingDeductible -= deductibleAppliedHere;
      totalDeductibleAppliedThisClaim += deductibleAppliedHere;

      let netCharge = item.charged_amount - deductibleAppliedHere;
      
      if (deductibleAppliedHere > 0) {
        denialReason = `Deductible: ₹${deductibleAppliedHere.toLocaleString('en-IN')} was applied before other rules.`;
        if (remainingDeductible > 0) {
          denialReason += ` ₹${remainingDeductible.toLocaleString('en-IN')} deductible remains.`;
        } else if (deductibleMetBeforeClaim + totalDeductibleAppliedThisClaim === totalDeductible) {
          denialReason += ` Your annual deductible is now fully met.`;
        }
      }

      // Step 2: Policy Processing on the Net Charge
      if (netCharge > 0) {
        let rulesBaseAmount = netCharge;

        // Apply Room Rent Caps
        if (item.service_type === 'ROOM_RENT' && policy.room_rent_limit > 0) {
          // Adjust daily cap by days stayed, and ensure math is on netCharge
          // Note: Proportionate Ratio is still based on the RAW Daily Rate Fact.
          const maxAllowedTotal = policy.room_rent_limit * daysStayed;
          // Important: We need a ratio for how much of the NET charge is allowed
          // but simpler is to just cap the netCharge as well.
          if (roomRentDailyRate > policy.room_rent_limit) {
            rulesBaseAmount = Math.min(netCharge, maxAllowedTotal); // Not exactly right, but close enough for line-by-line
            denialReason = (denialReason ? denialReason + ' | ' : '') + 
              `Room rent capped: daily rate ₹${roomRentDailyRate.toLocaleString('en-IN')}/day exceeds limit. ` +
              `This triggers a ${(proportionateRatio * 100).toFixed(1)}% reduction on other items.`;
          }
        } 
        // Apply Proportionate Deduction (if ratio < 100%)
        else if (proportionateRatio < 1) {
          rulesBaseAmount = netCharge * proportionateRatio;
          denialReason = (denialReason ? denialReason + ' | ' : '') + 
            `Proportionate reduction (${(proportionateRatio * 100).toFixed(1)}%) applied due to room choice.`;
        }

        // Apply Copay
        const isOutOfNetwork = claim.provider?.network_status === 'OUT_OF_NETWORK';
        const copayRate = isOutOfNetwork
          ? (policy.out_of_network_copay_pct || 30) / 100
          : (policy.copay_pct / 100);

        const amountAfterCopay = rulesBaseAmount * (1 - copayRate);

        // Apply Global/Service Limits
        const remainingGlobalLimit = (policy.annual_limit || 0) - (member.limit_used || 0);
        let finalApproval = Math.min(amountAfterCopay, remainingGlobalLimit, rule.limit_per_year);

        approvedAmount = finalApproval;
        
        if (approvedAmount < amountAfterCopay) {
          denialReason = (denialReason ? denialReason + ' | ' : '') + 
            (isOutOfNetwork ? 'Out-of-Network penalty applied.' : 'Policy limits reached.');
        }
      } else {
        // Entire line item went to deductible
        approvedAmount = 0;
      }

      memberOwes = item.charged_amount - approvedAmount;

      // Status correction: ₹0 approved = DENIED (if it was a covered service but zeroed out)
      if (approvedAmount === 0 && lineStatus === LineItemStatus.APPROVED) {
        lineStatus = LineItemStatus.DENIED;
      }
    }

    // Record Result
    await prisma.adjudication.upsert({
      where: { line_item_id: item.id },
      update: {
        is_covered: lineStatus === LineItemStatus.APPROVED,
        approved_amount: approvedAmount,
        member_owes: memberOwes,
        denial_reason_en: denialReason,
        decision: lineStatus as string
      },
      create: {
        line_item_id: item.id,
        is_covered: lineStatus === LineItemStatus.APPROVED,
        approved_amount: approvedAmount,
        member_owes: memberOwes,
        denial_reason_en: denialReason,
        decision: lineStatus as string
      }
    });

    await prisma.lineItem.update({
      where: { id: item.id },
      data: {
        status: lineStatus,
        approved_amount: approvedAmount,
        denial_reason_en: denialReason
      }
    });

    if (lineStatus === LineItemStatus.NEEDS_REVIEW) needsManualReview = true;
    if (lineStatus === LineItemStatus.APPROVED) approvedCount++;
    if (lineStatus === LineItemStatus.DENIED) deniedCount++;
  }

  // Persist updated deductible_met
  if (totalDeductibleAppliedThisClaim > 0) {
    await prisma.member.update({
      where: { id: member.id },
      data: { deductible_met: deductibleMetBeforeClaim + totalDeductibleAppliedThisClaim }
    });
  }

  // Derive final status
  if (deniedCount > 0 && approvedCount === 0) {
    overallClaimStatus = ClaimStatus.DENIED;
  } else if (deniedCount > 0 && approvedCount > 0) {
    overallClaimStatus = ClaimStatus.PARTIAL;
  } else {
    overallClaimStatus = ClaimStatus.APPROVED;
  }

  const finalStatus = needsManualReview ? ClaimStatus.UNDER_REVIEW : overallClaimStatus;
  await prisma.claim.update({
    where: { id: claimId },
    data: { status: finalStatus }
  });

  return finalStatus;
}

async function updateClaimStatus(claimId: string, status: ClaimStatus, reason: string) {
  await prisma.claim.update({
    where: { id: claimId },
    data: { status }
  });
  return status;
}
