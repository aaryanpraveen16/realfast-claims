import { FastifyRequest, FastifyReply } from 'fastify';
import * as authService from './auth.service';
import { RegisterInput, LoginInput } from './auth.types';

// TODO: register
// Input:  request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply
// Output: Promise<void>
// Rule:   Register a new user with email, password, and role. Hash the password.
// Calls:  authService.createUser
// Edge:   Prevent registration if email already exists (Prisma P2002).
export async function register(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}

// TODO: login
// Input:  request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply
// Output: Promise<void>
// Rule:   Authenticate user by email and password. Return a signed JWT.
// Calls:  authService.validateUser
// Edge:   Return 401 Unauthorized for invalid credentials without revealing if email exists.
export async function login(request: FastifyRequest, reply: FastifyReply) {
  reply.code(501).send({ message: "Not implemented" });
}
