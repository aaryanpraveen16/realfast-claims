import { FastifyInstance } from 'fastify';
import { getPending, decide } from './underwriting.controller';
import { getTimeline, postNote } from './underwriting.communication.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function underwritingRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT as any);
  
  // Communication routes (Open to Member and Underwriter/Admin)
  fastify.get('/timeline/:entityType/:entityId', getTimeline);
  fastify.post('/communication', postNote);

  fastify.get('/pending', {
    preHandler: [roleGuard(['UNDERWRITER', 'SUPER_ADMIN'] as any)]
  }, getPending);

  fastify.post('/decide/:id', {
    preHandler: [roleGuard(['UNDERWRITER', 'SUPER_ADMIN'] as any)]
  }, decide);
}
