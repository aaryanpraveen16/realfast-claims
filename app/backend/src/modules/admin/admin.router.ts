import { FastifyInstance } from 'fastify';
import * as adminController from './admin.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function adminRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  fastify.addHook('preHandler', roleGuard(['SUPER_ADMIN']));
  
  fastify.post('/policies', adminController.createPolicy);
  fastify.put('/policies/:id', adminController.updatePolicy);
  fastify.post('/policies/:id/coverage-rules', adminController.addCoverageRule);
  fastify.put('/coverage-rules/:id', adminController.updateCoverageRule);
  fastify.get('/users', adminController.getUsers);
  fastify.put('/users/:id/role', adminController.updateUserRole);
  fastify.get('/analytics', adminController.getAnalytics);
}
