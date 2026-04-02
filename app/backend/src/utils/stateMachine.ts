import { ClaimStatus, LineItemStatus, DisputeStatus } from '@prisma/client';

// TODO: transitionClaim
// Input:  claimId: string, newStatus: ClaimStatus
// Output: Promise<void>
// Rule:   Claims can only move forward in the lifecycle (e.g., SUBMITTED -> UNDER_REVIEW). 
//         Validated against a strict state matrix.
// Calls:  prisma.claim.update
// Edge:   Prevent transition to PAID if there are pending line items or disputes.
export async function transitionClaim(claimId: string, newStatus: ClaimStatus): Promise<void> {
  // TODO: Implement transitionClaim logic
}

// TODO: transitionLineItem
// Input:  lineItemId: string, newStatus: LineItemStatus
// Output: Promise<void>
// Rule:   Line items must be ADJUDICATING before they are APPROVED or DENIED.
// Calls:  prisma.lineItem.update
// Edge:   A claim's overall status must be updated if all line items are finalized.
export async function transitionLineItem(lineItemId: string, newStatus: LineItemStatus): Promise<void> {
  // TODO: Implement transitionLineItem logic
}

// TODO: transitionDispute
// Input:  disputeId: string, newStatus: DisputeStatus
// Output: Promise<void>
// Rule:   Disputes can only be FILED by members and then move to UNDER_REVIEW by adjudicators.
// Calls:  prisma.dispute.update
// Edge:   Updating a dispute to UPHELD must automatically trigger a re-adjudication of the line item.
export async function transitionDispute(disputeId: string, newStatus: DisputeStatus): Promise<void> {
  // TODO: Implement transitionDispute logic
}
