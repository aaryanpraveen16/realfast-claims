import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// TODO: globalErrorHandler
// Input:  error: Error, request: FastifyRequest, reply: FastifyReply
// Output: void
// Rule:   Centralized error handling for all routes. Formats exceptions into 
//         human-readable responses and logs the original stack for debugging.
// Calls:  Fastify log
// Edge:   Prisma's known error codes (P2002, etc.) should be mapped to 
//         specific HTTP status codes like 409 Conflict.
export function globalErrorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({ message: 'Validation Error', errors: error.validation });
  }

  reply.status(500).send({ message: 'Internal Server Error' });
}
