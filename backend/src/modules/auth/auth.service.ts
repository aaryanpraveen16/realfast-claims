import { prisma } from '../../config/db';
import { RegisterInput, LoginInput, AuthResponse, JWTPayload } from './auth.types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole, NetworkStatus } from '@prisma/client';

import path from 'path';
import fs from 'fs';

export async function register(
  input: RegisterInput, 
  fileData?: { buffer: Buffer, filename: string }
): Promise<AuthResponse> {
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

  if (input.role === UserRole.MEMBER) {
    let health_report_url = null;
    if (fileData) {
      const fileName = `member_${Date.now()}_${fileData.filename}`;
      const uploadPath = path.join(__dirname, '../../../public/uploads', fileName);
      
      await fs.promises.writeFile(uploadPath, fileData.buffer);
      health_report_url = `/uploads/${fileName}`;
    }

    await prisma.member.create({
      data: {
        user_id: user.id,
        name: input.name,
        phone: input.phone || '',
        status: input.medical_conditions ? 'PENDING_UNDERWRITING' : 'ACTIVE',
        dob: input.dob || new Date(),
        aadhaar_hash: input.aadhaar_hash || '',
        medical_conditions: input.medical_conditions,
        health_report_url,
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
