import { FastifyReply, FastifyRequest } from 'fastify';
import * as underwritingService from './underwriting.service';

export async function getPending(request: FastifyRequest, reply: FastifyReply) {
  const pending = await underwritingService.getPendingDependents();
  return reply.send(pending);
}

export async function decide(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const decision = request.body as underwritingService.UnderwritingDecision;
  
  // Attach underwriter id from token
  const user = (request as any).user;
  decision.underwriter_id = user.userId;

  const updated = await underwritingService.decideDependent(id, decision);
  return reply.send(updated);
}
