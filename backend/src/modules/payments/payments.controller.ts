import { FastifyRequest, FastifyReply } from 'fastify';
import * as paymentsService from './payments.service';
import * as membersService from '../members/members.service';

/**
 * Handle premium payment processing.
 */
export async function processPremiumPayment(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const { policyId, amount, method } = request.body as { policyId: string, amount: number, method: string };

  const member = await membersService.getMemberByUserId(userId);
  if (!member) {
    return reply.status(404).send({ message: 'Member not found' });
  }

  try {
    const payment = await paymentsService.processPremiumPayment(
      member.id,
      policyId,
      amount,
      method
    );

    return reply.send({
      message: 'Payment processed successfully',
      payment
    });
  } catch (err: any) {
    return reply.status(500).send({ message: err.message });
  }
}

/**
 * Handle claim payments (stubs).
 */
export async function getPaymentByAdjudication(request: FastifyRequest, reply: FastifyReply) {
  const { adjudicationId } = request.params as { adjudicationId: string };
  const payment = await paymentsService.getPaymentByAdjudicationId(adjudicationId);
  if (!payment) return reply.status(404).send({ message: 'Payment not found' });
  return reply.send(payment);
}
