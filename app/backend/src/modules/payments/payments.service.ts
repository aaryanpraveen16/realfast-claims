import { prisma } from '../../config/db';

/**
 * Rule:   Process a premium payment for a member's policy.
 * Input:  memberId, policyId, amount, method
 * Output: Promise<PremiumPayment>
 * Action: Create PremiumPayment record and update Member status to ACTIVE.
 */
export async function processPremiumPayment(
  memberId: string, 
  policyId: string, 
  amount: number, 
  method: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the payment record
    const payment = await tx.premiumPayment.create({
      data: {
        member_id: memberId,
        policy_id: policyId,
        amount,
        method,
        status: 'PAID',
        paid_at: new Date(),
      }
    });

    // 2. Update member status and policy
    await tx.member.update({
      where: { id: memberId },
      data: {
        status: 'ACTIVE',
        policy_id: policyId
      }
    });

    return payment;
  });
}

// Existing claim-related stubs preserved/implemented
export async function createPaymentRecord(id: string, amount: number, paidTo: any) {
  return prisma.payment.create({
    data: {
      adjudication_id: id,
      amount,
      paid_to: paidTo,
      method: 'BANK_TRANSFER',
      status: 'PROCESSED',
      paid_at: new Date(),
    }
  });
}

export async function getPaymentByAdjudicationId(id: string) {
  return prisma.payment.findUnique({
    where: { adjudication_id: id }
  });
}
