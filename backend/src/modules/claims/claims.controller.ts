import { FastifyRequest, FastifyReply } from 'fastify';

// TODO: createClaim
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Submit a new claim. Validate fields against Member, Policy, and Providers.
// Calls:  claimsService.submitClaim, adjudicationQueue.add
// Edge:   Calculate SLA deadline (24h or 48h) based on claim type on submission.
export async function createClaim(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getClaim
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Fetch details of a single claim, including all line items.
// Calls:  claimsService.getClaimDetail
// Edge:   Ensure the calling Member belongs to the claim's policy or is the Provider.
export async function getClaim(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getClaimEOB
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Retrieve the Explanation of Benefits for a claim. Check claim status is PAID or APPROVED.
// Calls:  claimsService.getEOBByClaimId
// Edge:   If EOB is not yet generated, return 202 Accepted if it is in progress.
export async function getClaimEOB(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getMyClaims
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Fetch all claims for the currently logged-in member.
// Calls:  claimsService.getClaimsByMemberId
// Edge:   Support pagination and filtering by claim status.
export async function getMyClaims(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
