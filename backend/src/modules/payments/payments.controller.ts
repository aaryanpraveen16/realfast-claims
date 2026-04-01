import { FastifyRequest, FastifyReply } from 'fastify';

// TODO: processPayment
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Initiate payment through stub Razorpay interface.
// Calls:  paymentsService.createPaymentRecord, Razorpay API stub
// Edge:   Prevent duplicate payment processing for the same adjudication ID.
export async function processPayment(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getPaymentDetail
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Retrieve status and details of a processed payment.
// Calls:  paymentsService.getPaymentByAdjudicationId
// Edge:   Handle scenarios where payment is PENDING but may have failed on provider side.
export async function getPaymentDetail(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
