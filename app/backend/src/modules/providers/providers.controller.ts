import { FastifyRequest, FastifyReply } from 'fastify';
import * as providersService from './providers.service';

export async function checkEligibility(request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) {
  const user = request.user as any;
  const result = await providersService.checkEligibility(request.params.memberId, user.userId);
  return reply.send(result);
}

export async function getAllProviders(request: FastifyRequest, reply: FastifyReply) {
  const providers = await providersService.getAllProviders();
  return reply.send(providers);
}
