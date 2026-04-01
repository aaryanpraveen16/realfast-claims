import { FastifyInstance } from 'fastify';
import * as providersController from './providers.controller';
import { verifyJWT } from '../../middleware/auth';

export async function providersRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.get('/', providersController.getAllProviders);
  fastify.get('/eligibility/:memberId', providersController.checkEligibility);
}
