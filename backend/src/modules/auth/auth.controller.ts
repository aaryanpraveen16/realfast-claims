import { FastifyReply, FastifyRequest } from 'fastify';
import { RegisterInput, LoginInput } from './auth.types';
import * as authService from './auth.service';
import { UserRole } from '@prisma/client';

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let data: any = {};
    let filePart: any = null;

    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          filePart = { buffer, filename: part.filename };
        } else {
          data[part.fieldname] = (part as any).value;
        }
      }
    } else {
      data = request.body as any;
    }
    
    // Convert password_hash if it came via password field
    if (data.password && !data.password_hash) {
      data.password_hash = data.password;
    }

    // Basic validation
    if (!data.email || !data.password_hash || !data.role || !data.name) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }
    
    // Additional validation for MEMBER and PROVIDER
    if (data.role === UserRole.MEMBER || data.role === UserRole.PROVIDER) {
      if (!data.phone) {
        return reply.status(400).send({ message: 'Phone is required for Member and Provider' });
      }
    }

    if (data.dob) {
      data.dob = new Date(data.dob);
    }

    const authResponse = await authService.register(data, filePart);
    return reply.status(201).send(authResponse);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return reply.status(status).send({ message: error.message });
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  try {
    const data = request.body as LoginInput;
    
    if (!data.email || !data.password_hash) {
      return reply.status(400).send({ message: 'Email and password are required' });
    }

    const authResponse = await authService.login(data);
    return reply.status(200).send(authResponse);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return reply.status(status).send({ message: error.message });
  }
}
