import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

// TODO: roleGuard
// Input:  allowedRoles: UserRole[]
// Output: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
// Rule:   Restrict access based on UserRole. Only roles in the allowedRoles list can proceed.
// Calls:  request.user.role (from decoded JWT)
// Edge:   SUPER_ADMIN must bypass all role checks and be allowed access to everything.
export const roleGuard = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Role check logic stub
    const userRole = (request.user as any)?.role as UserRole;
    if (!allowedRoles.includes(userRole) && userRole !== UserRole.SUPER_ADMIN) {
      reply.status(403).send({ message: 'Forbidden' });
    }
  };
};
