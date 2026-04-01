import { FastifyRequest, FastifyReply } from 'fastify';
import * as membersService from './members.service';

// Rule:   Retrieve the member profile for the currently authenticated user.
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const member = await membersService.getMemberByUserId(userId);
  
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  return reply.send(member);
}

// Rule:   Update member info while excluding restricted fields.
export async function updateMe(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const member = await membersService.getMemberByUserId(userId);
  
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  const updated = await membersService.updateMember(member.id, request.body);
  return reply.send(updated);
}

// Rule:   Add a new dependent to the member's policy.
export async function addDependent(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const member = await membersService.getMemberByUserId(userId);
  
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  try {
    const parts = request.parts();
    const data: any = {};
    let filePart: any = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        filePart = { buffer, filename: part.filename };
      } else {
        // String fields
        data[part.fieldname] = (part as any).value;
      }
    }

    if (!data.name || !data.dob || !data.relationship || !data.aadhaar_hash) {
       return reply.status(400).send({ message: 'Missing required fields' });
    }

    const dependent = await membersService.createDependent(member.id, data, filePart);
    return reply.send(dependent);
  } catch (err: any) {
    return reply.status(err.statusCode || 400).send({ message: err.message });
  }
}



// Rule:   Retrieve all dependents associated with this member.
export async function getDependents(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const member = await membersService.getMemberByUserId(userId);
  
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  const dependents = await membersService.getDependentsByMemberId(member.id);
  return reply.send(dependents);
}

// Rule:   Fetch policy details for the currently logged-in member.
export async function getPolicy(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const member = await membersService.getMemberByUserId(userId);
  
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  const policy = await membersService.getMemberPolicy(member.id);
  if (!policy) {
    return reply.status(404).send({ message: 'No policy found for this member' });
  }
  
  return reply.send(policy);
}

// Rule:   Select a policy for the current member.
export async function selectPolicy(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const { policyId } = request.body as { policyId: string };
  
  if (!policyId) {
    return reply.status(400).send({ message: 'policyId is required' });
  }
  
  const member = await membersService.getMemberByUserId(userId);
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  const updatedMember = await membersService.selectPolicy(member.id, policyId);
  return reply.send(updatedMember);
}
// Rule:   Process payment for a dependent premium to activate them.
export async function payDependentPremium(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  const { dependentId } = request.params as { dependentId: string };
  const paymentData = request.body as { method: string };
  
  const member = await membersService.getMemberByUserId(userId);
  if (!member) {
    return reply.status(404).send({ message: 'Member profile not found' });
  }
  
  try {
    const updatedDependent = await membersService.payDependentPremium(member.id, dependentId, paymentData);
    return reply.send(updatedDependent);
  } catch (err: any) {
    return reply.status(err.statusCode || 400).send({ message: err.message });
  }
}
