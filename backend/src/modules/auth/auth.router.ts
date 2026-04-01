import { FastifyInstance } from 'fastify';
import * as authController from './auth.controller';

export async function authRouter(fastify: FastifyInstance) {
  fastify.post('/register', authController.register);
  fastify.post('/login', authController.login);
}
