import { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env';

// TODO: verifyJWT
// Input:  request: FastifyRequest, reply: FastifyReply
// Output: Promise<void>
// Rule:   Check for valid JSON Web Token in the Authorization header (Bearer token).
//         Populate request.user with decoded payload.
// Calls:  fastify-jwt.verify
// Edge:   Handle expired tokens gracefully and return 401.
export const verifyJWT = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
};
