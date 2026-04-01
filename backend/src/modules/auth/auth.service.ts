import { prisma } from '../../config/db';
import { RegisterInput, LoginInput, AuthResponse, JWTPayload } from './auth.types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole, NetworkStatus } from '@prisma/client';

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    const error = new Error('Email already exists');
    (error as any).statusCode = 409;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(input.password_hash, saltRounds);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password_hash: passwordHash,
      role: input.role,
    },
  });

  // TODO: restrict ADJUDICATOR and SUPER_ADMIN roles to invite-only in production
  if (input.role === UserRole.MEMBER) {
    await prisma.member.create({
      data: {
        user_id: user.id,
        name: input.name,
        phone: input.phone || '',
        status: 'ACTIVE',
        dob: input.dob || new Date(),
        aadhaar_hash: input.aadhaar_hash || '',
      },
    });
  } else if (input.role === UserRole.PROVIDER) {
    await prisma.provider.create({
      data: {
        user_id: user.id,
        name: input.name,
        license_no: input.license_no || '',
        network_status: NetworkStatus.OUT_OF_NETWORK,
        specialty: input.specialty || '',
        city: input.city || '',
        state: input.state || '',
      },
    });
  }

  const payload: JWTPayload = {
    userId: user.id,
    role: user.role,
  };

  const token = signJWT(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(input.password_hash, user.password_hash);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  const payload: JWTPayload = {
    userId: user.id,
    role: user.role,
  };

  const token = signJWT(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
