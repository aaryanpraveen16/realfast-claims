import { FastifyReply, FastifyRequest } from 'fastify';
import * as adjudicationService from './adjudication.service';
import { AdjudicationInput } from './adjudication.types';

export async function getQueue(request: FastifyRequest, reply: FastifyReply) {
  try {
    const queue = await adjudicationService.getAdjudicationQueue();
    return reply.send(queue);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to fetch adjudication queue' });
  }
}

export async function getAdjudicationDetail(
  request: any,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const detail = await adjudicationService.getAdjudicationDetail(id);
    if (!detail) {
      return reply.status(404).send({ error: 'Claim details not found' });
    }
    return reply.send(detail);
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to fetch claim details' });
  }
}

export async function decideLineItem(
  request: any,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    await adjudicationService.decideLineItem(id, request.body);
    return reply.status(200).send({ status: 'Decision recorded' });
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to record decision' });
  }
}

export async function overrideLineItem(
  request: any,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    await adjudicationService.overrideLineItem(id, request.body);
    return reply.status(200).send({ status: 'Override recorded' });
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to record override' });
  }
}

export async function resolveDispute(
  request: any,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    await adjudicationService.resolveDispute(id, request.body);
    return reply.status(200).send({ status: 'Dispute resolved' });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
}
