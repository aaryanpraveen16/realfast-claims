import { prisma } from '../../config/db';

// TODO: createDispute
// Input:  adjudicationId: string, reason: string
// Output: Promise<Dispute>
// Rule:   Create a new dispute for checking.
export async function createDispute(id: string, reason: string) {
  // TODO: Implement createDispute logic
}

// TODO: getDisputeDetail
// Input:  disputeId: string
// Output: Promise<Dispute | null>
// Rule:   Retrieve detail for a dispute.
export async function getDisputeDetail(id: string) {
  // TODO: Implement getDisputeDetail logic
}

// TODO: resolveDispute
// Input:  disputeId: string, outcome: string
// Output: Promise<void>
// Rule:   Resolve the dispute and transition its status.
export async function resolveDispute(id: string, outcome: string) {
  // TODO: Implement resolveDispute logic
}
