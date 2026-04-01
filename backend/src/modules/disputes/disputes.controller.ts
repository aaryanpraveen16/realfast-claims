import { FastifyRequest, FastifyReply } from 'fastify';

// TODO: createDispute
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Member files a dispute against an adjudication decision.
// Calls:  disputesService.createDispute, transitionDispute
// Edge:   Dispute must be filed within 30 days of adjudication.
export async function createDispute(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getDispute
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Fetch details of a dispute and its current status.
// Calls:  disputesService.getDisputeDetail
// Edge:   Ensure member can only see their own disputes.
export async function getDispute(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: resolveDispute
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Adjudicator resolves a dispute with an outcome (UPHELD/REJECTED).
// Calls:  disputesService.resolveDispute, transitionDispute
// Edge:   If UPHELD, the associated line item must be re-queued for adjudication.
export async function resolveDispute(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
