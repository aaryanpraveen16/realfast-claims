import { UserRole } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password_hash: string;
}
