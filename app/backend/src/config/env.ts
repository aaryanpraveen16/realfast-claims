import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  PORT: z.string().transform((v) => parseInt(v, 10)).default('3000'),
  RAZORPAY_KEY_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
