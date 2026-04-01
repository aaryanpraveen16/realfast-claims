import { FastifyRequest, FastifyReply } from 'fastify';
import * as claimsService from './claims.service';
import { SubmitClaimInput } from './claims.types';
import { SubmittedBy, UserRole } from '@prisma/client';

export async function submitClaim(request: FastifyRequest<{ Body: SubmitClaimInput }>, reply: FastifyReply) {
  const user = request.user as any;
  const submittedBy = user.role === UserRole.MEMBER ? SubmittedBy.MEMBER : SubmittedBy.PROVIDER;
  
  const claim = await claimsService.submitClaim(request.body, submittedBy, user.userId);
  return reply.code(201).send(claim);
}

export async function getClaimById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = request.user as any;
  const claim = await claimsService.getClaimById(request.params.id, user.userId, user.role);
  return reply.send(claim);
}

export async function getMemberClaims(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  if (user.role !== UserRole.MEMBER) {
    return reply.code(403).send({ error: 'Only members can access this endpoint.' });
  }
  const claims = await claimsService.getMemberClaims(user.userId);
  return reply.send(claims);
}

export async function getProviderClaims(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  if (user.role !== UserRole.PROVIDER) {
    return reply.code(403).send({ error: 'Only providers can access this endpoint.' });
  }
  const claims = await claimsService.getProviderClaims(user.userId);
  return reply.send(claims);
}

export async function uploadClaimDocument(request: FastifyRequest, reply: FastifyReply) {
  // Logic for @fastify/multipart
  const parts = request.files();
  const filePaths: string[] = [];
  
  for await (const part of parts) {
    const fileName = `${Date.now()}_${part.filename}`;
    const uploadPath = `public/uploads/claims/${fileName}`;
    filePaths.push(`/uploads/claims/${fileName}`);
    // Save file buffer
    const fs = require('fs');
    const path = require('path');
    const buffer = await part.toBuffer();
    await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.promises.writeFile(uploadPath, buffer);
  }
  
  return reply.send({ file_paths: filePaths });
}
