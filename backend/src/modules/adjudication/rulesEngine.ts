import { prisma } from '../../config/db';
import { ClaimStatus, LineItemStatus } from '@prisma/client';

/**
 * Core Adjudication Rules Engine
 * Processes a claim against policy rules, member limits, and PED waiting periods.
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

  let overallClaimStatus: ClaimStatus = ClaimStatus.APPROVED;
  let needsManualReview = false;

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
    // PED Check
    else if (claim.ped_flag && rule.ped_exclusion && policyAgeDays < policy.ped_waiting_days) {
      lineStatus = LineItemStatus.DENIED;
      denialReason = `Pre-Existing Disease (PED) exclusion period of ${policy.ped_waiting_days} days not met.`;
    }
    // Pre-auth Check (Simple heuristic: Flag if high amount or specific types)
    else if (rule.requires_preauth && item.charged_amount > 50000) {
      lineStatus = LineItemStatus.NEEDS_REVIEW;
      denialReason = 'High value claim requires manual pre-authorization verification.';
    }
    else {
      // Calculate Approved Amount after Copay (Network-Aware)
      const isOutOfNetwork = claim.provider?.network_status === 'OUT_OF_NETWORK';
      const copayRate = isOutOfNetwork 
        ? (policy.out_of_network_copay_pct || 30) / 100 
        : (policy.copay_pct / 100);
      
      const potentialApproval = item.charged_amount * (1 - copayRate);
      
      // Limit Checks
      const remainingGlobalLimit = (policy.annual_limit || 0) - (member.limit_used || 0);
      const finalApproval = Math.min(potentialApproval, remainingGlobalLimit, rule.limit_per_year);

      approvedAmount = finalApproval;
      memberOwes = item.charged_amount - approvedAmount;
      
      if (approvedAmount < potentialApproval) {
        denialReason = isOutOfNetwork 
          ? 'Approved amount reduced due to Out-of-Network penalty and policy limits.'
          : 'Approved amount capped by policy or service limits.';
      }
    }

    // Record Adjudication Result
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

    // Update Line Item Status
    await prisma.lineItem.update({
      where: { id: item.id },
      data: { 
        status: lineStatus,
        approved_amount: approvedAmount,
        denial_reason_en: denialReason
      }
    });

    if (lineStatus === LineItemStatus.NEEDS_REVIEW) needsManualReview = true;
    
    // Status Logic: Any denial makes it PARTIAL (if others approved) or DENIED (if all denied)
    if (lineStatus === LineItemStatus.DENIED) {
       if (overallClaimStatus === ClaimStatus.APPROVED) overallClaimStatus = ClaimStatus.PARTIAL;
    }
  }

  // Final check: if all were denied, status is DENIED
  const allDenied = claim.line_items.every((li: any) => li.status === LineItemStatus.DENIED);
  if (allDenied && !needsManualReview) overallClaimStatus = ClaimStatus.DENIED;

  // 3. Final Transition
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
  console.log(`Claim ${claimId} auto-transition: ${status} | Reason: ${reason}`);
  return status;
}
