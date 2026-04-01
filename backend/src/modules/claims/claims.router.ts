import { FastifyInstance } from 'fastify';
import * as claimsController from './claims.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function claimsRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.post('/', { preHandler: roleGuard(['MEMBER', 'PROVIDER']) }, claimsController.createClaim);
  fastify.get('/:id', { preHandler: roleGuard(['MEMBER', 'PROVIDER', 'ADJUDICATOR']) }, claimsController.getClaim);
  fastify.get('/:id/eob', { preHandler: roleGuard(['MEMBER']) }, claimsController.getClaimEOB);
  fastify.get('/me', { preHandler: roleGuard(['MEMBER']) }, claimsController.getMyClaims);
}
