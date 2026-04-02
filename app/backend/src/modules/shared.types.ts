import { PaidTo, PaymentStatus } from '@prisma/client';

export interface ProcessPaymentInput {
  adjudication_id: string;
  amount: number;
  paid_to: PaidTo;
  method: string;
}

export interface DisputeInput {
  adjudication_id: string;
  reason: string;
  supporting_docs?: string;
}

export interface AdminPolicyInput {
  name: string;
  plan_type: any;
  premium: number;
  deductible: number;
  annual_limit: number;
}
