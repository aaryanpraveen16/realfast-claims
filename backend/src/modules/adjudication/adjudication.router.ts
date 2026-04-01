import { FastifyInstance } from 'fastify';
import * as adjudicationController from './adjudication.controller';
import { verifyJWT } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

export async function adjudicationRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);
  
  fastify.get('/queue', { preHandler: roleGuard(['ADJUDICATOR']) }, adjudicationController.getQueue);
  fastify.get('/claims/:id', { preHandler: roleGuard(['ADJUDICATOR']) }, adjudicationController.getAdjudicationDetail);
  fastify.post('/line-items/:id/decide', { preHandler: roleGuard(['ADJUDICATOR']) }, adjudicationController.decideLineItem);
  fastify.post('/line-items/:id/override', { preHandler: roleGuard(['ADJUDICATOR']) }, adjudicationController.overrideLineItem);
}
