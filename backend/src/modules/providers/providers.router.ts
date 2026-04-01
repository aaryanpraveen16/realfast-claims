import { FastifyInstance } from 'fastify';
import * as providersController from './providers.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function providersRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.get('/eligibility/:memberId', { preHandler: roleGuard(['PROVIDER']) }, providersController.checkEligibility);
  fastify.post('/claims', { preHandler: roleGuard(['PROVIDER']) }, providersController.submitCashlessClaim);
}
