import { FastifyInstance } from 'fastify';
import { registerHandler, loginHandler } from './auth.controller';

export async function authRouter(fastify: FastifyInstance) {
  fastify.post('/register', registerHandler);
  fastify.post('/login', loginHandler);
}
