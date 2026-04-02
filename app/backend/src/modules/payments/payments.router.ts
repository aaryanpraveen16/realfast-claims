import { FastifyInstance } from 'fastify';
import * as paymentsController from './payments.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function paymentsRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  // Rule:   Process a premium payment for a member's policy.
  fastify.post('/premium', { preHandler: roleGuard(['MEMBER']) }, paymentsController.processPremiumPayment);

  // Claim-related stubs
  fastify.get('/adjudication/:adjudicationId', { preHandler: roleGuard(['MEMBER', 'PROVIDER', 'ADJUDICATOR']) }, paymentsController.getPaymentByAdjudication);
}
