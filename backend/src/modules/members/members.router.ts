import { FastifyInstance } from 'fastify';
import * as membersController from './members.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function membersRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.get('/me', { preHandler: roleGuard(['MEMBER']) }, membersController.getMe);
  fastify.put('/me', { preHandler: roleGuard(['MEMBER']) }, membersController.updateMe);
  fastify.post('/me/dependents', { preHandler: roleGuard(['MEMBER']) }, membersController.addDependent);
  fastify.get('/me/dependents', { preHandler: roleGuard(['MEMBER']) }, membersController.getDependents);
  fastify.get('/me/policy', { preHandler: roleGuard(['MEMBER']) }, membersController.getPolicy);
}
