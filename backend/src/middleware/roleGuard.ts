import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

// TODO: requireRole
// Input:  allowedRoles: UserRole[] (as spread arguments)
// Output: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
// Rule:   Restrict access based on UserRole. Only roles in the allowedRoles list can proceed.
// Calls:  request.user.role (from decoded JWT)
export const requireRole = (...roles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = ((request.user as any)?.role) as UserRole;
    if (!roles.includes(userRole)) {
      reply.status(403).send({ message: 'Forbidden' });
    }
  };
};

export const roleGuard = (roles: UserRole[]) => {
  return requireRole(...roles); // Backwards compatibility if needed, or just map it
};
