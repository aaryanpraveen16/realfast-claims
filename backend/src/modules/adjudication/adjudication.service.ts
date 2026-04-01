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

// TODO: getAdjudicationDetail
// Input:  claimId: string
// Output: Promise<Claim | null>
// Rule:   Fetch claim with detail for adjudication.
export async function getAdjudicationDetail(id: string) {
  // TODO: Implement getAdjudicationDetail logic
  return null;
}

// TODO: decideLineItem
// Input:  lineItemId: string, decision: any
// Output: Promise<void>
// Rule:   Finalize a manual adjudication decision.
export async function decideLineItem(id: string, decision: any) {
  // TODO: Implement decideLineItem logic
}

// TODO: overrideLineItem
// Input:  lineItemId: string, decision: any
// Output: Promise<void>
// Rule:   Override an automated or manual decision by an admin.
export async function overrideLineItem(id: string, decision: any) {
  // TODO: Implement overrideLineItem logic
}
