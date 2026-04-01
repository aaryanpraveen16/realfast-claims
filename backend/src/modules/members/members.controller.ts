import { FastifyRequest, FastifyReply } from 'fastify';

// TODO: getMe
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Retrieve the member profile for the currently authenticated user.
// Calls:  membersService.getMemberByUserId
// Edge:   If the user has a User role but no Member record, return 404.
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: updateMe
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Update member info like phone or address. Phone validation required.
// Calls:  membersService.updateMember
// Edge:   Prevent updating restricted fields like aadhaar_hash or dob.
export async function updateMe(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: addDependent
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Add a new dependent to the member's policy. Validate relation.
// Calls:  membersService.createDependent
// Edge:   Verify policy limit for total number of dependents if FAMILY_FLOATER.
export async function addDependent(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getDependents
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Retrieve all dependents associated with this member.
// Calls:  membersService.getDependentsByMemberId
// Edge:   Return an empty array if no dependents are found.
export async function getDependents(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: getPolicy
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Fetch policy details for the currently logged-in member.
// Calls:  membersService.getMemberPolicy
// Edge:   Policy data must include coverage rules for the member's visibility.
export async function getPolicy(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
