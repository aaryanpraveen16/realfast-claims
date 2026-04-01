import { FastifyInstance } from 'fastify';
import * as paymentsController from './payments.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function paymentsRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.post('/', { preHandler: roleGuard(['ADJUDICATOR', 'SUPER_ADMIN']) }, paymentsController.processPayment);
  fastify.get('/:id', { preHandler: roleGuard(['MEMBER', 'PROVIDER', 'ADJUDICATOR']) }, paymentsController.getPaymentDetail);
}
