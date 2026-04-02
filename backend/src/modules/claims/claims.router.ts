import { FastifyInstance } from 'fastify';
import * as claimsController from './claims.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function claimsRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.post('/', claimsController.submitClaim);
  fastify.get('/:id', claimsController.getClaimById);
  fastify.get('/me/member', { preHandler: roleGuard(['MEMBER']) }, claimsController.getMemberClaims);
  fastify.get('/me/provider', { preHandler: roleGuard(['PROVIDER']) }, claimsController.getProviderClaims);
  fastify.post('/upload', claimsController.uploadClaimDocument);
  fastify.post('/:id/dispute', { preHandler: roleGuard(['MEMBER']) }, claimsController.submitDispute);
}
