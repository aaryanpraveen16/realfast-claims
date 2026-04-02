import { FastifyInstance } from 'fastify';
import * as disputesController from './disputes.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function disputesRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.post('/', { preHandler: roleGuard(['MEMBER']) }, disputesController.createDispute);
  fastify.get('/:id', { preHandler: roleGuard(['MEMBER', 'ADJUDICATOR']) }, disputesController.getDispute);
  fastify.post('/:id/resolve', { preHandler: roleGuard(['ADJUDICATOR']) }, disputesController.resolveDispute);
}
