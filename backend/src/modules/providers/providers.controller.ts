import { FastifyRequest, FastifyReply } from 'fastify';

// TODO: checkEligibility
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Provider checks if a member's policy is active and covers potential service.
// Calls:  membersService.getMemberPolicy, adjudication.rulesEngine (eligibility only)
// Edge:   Policy might be active but the specific service_type could be excluded.
export async function checkEligibility(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: submitCashlessClaim
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Provider submits a claim on behalf of a member for direct settlement.
// Calls:  claimsService.submitClaim (claim_type: CASHLESS)
// Edge:   If provider is OUT_OF_NETWORK, cashless claims must be rejected upfront.
export async function submitCashlessClaim(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
