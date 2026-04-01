import { FastifyInstance } from 'fastify';
import * as policiesService from './policies.service';
import { verifyJWT } from '../../middleware/auth';

export async function policiesRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.get('/', async (request, reply) => {
    const policies = await policiesService.listAllPolicies();
    return reply.send(policies);
  });
}
