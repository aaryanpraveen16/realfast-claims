import { prisma } from '../../config/db';

export async function getPendingDependents() {
  return prisma.dependent.findMany({
    where: { 
      status: 'PENDING_UNDERWRITING',
      is_active: false
    },
    include: {
      member: {
        include: {
          policy: true
        }
      }
    },
    orderBy: { dob: 'asc' } // Older first
  });
}

export async function getDependentById(id: string) {
  return prisma.dependent.findUnique({
    where: { id },
    include: {
      member: {
        include: {
          policy: true
        }
      }
    }
  });
}

export interface UnderwritingDecision {
  status: 'AWAITING_PAYMENT' | 'REJECTED';
  loading_amount?: number;
  exclusions_json?: any;
  underwriter_notes?: string;
  underwriter_id: string;
}

export async function decideDependent(id: string, decision: UnderwritingDecision) {
  return prisma.dependent.update({
    where: { id },
    data: {
      status: decision.status,
      loading_amount: decision.loading_amount || 0,
      exclusions_json: decision.exclusions_json ? JSON.stringify(decision.exclusions_json) : null,
      underwriter_notes: decision.underwriter_notes,
      underwriter_id: decision.underwriter_id
    }
  });
}
