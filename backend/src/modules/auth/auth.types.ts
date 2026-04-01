import { UserRole } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password_hash: string;
  role: UserRole;
  name: string;
  phone?: string;
  license_no?: string;
  dob?: Date;
  aadhaar_hash?: string;
  specialty?: string;
  city?: string;
  state?: string;
}

export interface LoginInput {
  email: string;
  password_hash: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
