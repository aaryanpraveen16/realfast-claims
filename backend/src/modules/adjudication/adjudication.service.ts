import { prisma } from '../../config/db';

export async function getAdjudicationQueue() {
  const claims = await prisma.claim.findMany({
    where: {
      status: 'UNDER_REVIEW',
    },
    include: {
      member: true,
      provider: true,
      line_items: true,
    },
    orderBy: {
      sla_deadline: 'asc',
    },
  });

  return claims.map((claim) => ({
    id: claim.id,
    member_name: claim.member.name,
    provider_name: claim.provider.name,
    claim_type: claim.claim_type,
    status: claim.status,
    submitted_at: claim.submitted_at,
    total_charged: claim.line_items.reduce((sum, li) => sum + li.charged_amount, 0),
    sla_deadline: claim.sla_deadline,
  }));
}

import { eobQueue } from '../../config/queue';
import { ClaimStatus, LineItemStatus } from '@prisma/client';

export async function getAdjudicationDetail(id: string) {
  return prisma.claim.findUnique({
    where: { id },
    include: {
      member: {
        include: {
          policy: {
             include: { coverage_rules: true }
          }
        }
      },
      provider: true,
      line_items: {
        include: { adjudication: true }
      }
    }
  });
}

export async function decideLineItem(lineItemId: string, decision: any) {
  const { is_covered, approved_amount, member_owes, denial_reason_en } = decision;

  return prisma.$transaction(async (tx) => {
    // 1. Update Adjudication result
    const adj = await tx.adjudication.update({
      where: { line_item_id: lineItemId },
      data: {
        is_covered,
        approved_amount,
        member_owes,
        denial_reason_en,
        decision: is_covered ? LineItemStatus.APPROVED : LineItemStatus.DENIED,
        adjudicated_at: new Date(),
        // Note: In a real system, we'd record adjudicated_by from the actor context
      }
    });

    // 2. Update Line Item Status
    const lineItem = await tx.lineItem.update({
      where: { id: lineItemId },
      data: {
        status: is_covered ? LineItemStatus.APPROVED : LineItemStatus.DENIED,
        approved_amount
      },
      include: { claim: { include: { line_items: true } } }
    });

    // 3. Check if overall claim can transition from UNDER_REVIEW
    const allDecided = lineItem.claim.line_items.every(li => 
      li.status === LineItemStatus.APPROVED || li.status === LineItemStatus.DENIED
    );

    if (allDecided) {
      const anyApproved = lineItem.claim.line_items.some(li => li.status === LineItemStatus.APPROVED);
      const finalStatus = anyApproved ? ClaimStatus.APPROVED : ClaimStatus.DENIED;
      
      await tx.claim.update({
        where: { id: lineItem.claim_id },
        data: { status: finalStatus }
      });

      // 4. Trigger EOB Queue
      await eobQueue.add('generate_eob', { claimId: lineItem.claim_id });
    }
  });
}

export async function overrideLineItem(lineItemId: string, decision: any) {
  // Overrides are similar to decisions but might bypass some basic rules
  // For the MVP, we reuse the same logic
  return decideLineItem(lineItemId, decision);
}
