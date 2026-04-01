import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { ClaimStatus, LineItemStatus } from '@prisma/client';

/**
 * EOB Generation Worker
 * Consolidates adjudication results and generates the Explanation of Benefits.
 */
const worker = new Worker(
  'eob',
  async (job: Job<{ claimId: string }>) => {
    const { claimId } = job.data;
    console.log(`Generating EOB for claim: ${claimId}`);

    try {
      // 1. Fetch Claim with Adjudication details
      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        include: {
          line_items: {
            include: { adjudication: true }
          }
        }
      });

      if (!claim) throw new Error('Claim not found');

      // 2. Consolidate Financials
      let totalCharged = 0;
      let totalApproved = 0;
      let memberOwes = 0;
      const breakdown: any[] = [];

      for (const item of claim.line_items) {
        totalCharged += item.charged_amount;
        const adj = item.adjudication;
        
        if (adj) {
          totalApproved += adj.approved_amount || 0;
          memberOwes += adj.member_owes || 0;
          breakdown.push({
            service_type: item.service_type,
            charged: item.charged_amount,
            approved: adj.approved_amount,
            member_owes: adj.member_owes,
            status: adj.decision,
            reason: adj.denial_reason_en
          });
        }
      }

      // 3. Create EOB Record
      await (prisma as any).eOB.upsert({
        where: { claim_id: claimId },
        update: {
          total_charged: totalCharged,
          total_approved: totalApproved,
          member_owes: memberOwes,
          breakdown_json: JSON.stringify(breakdown),
          issued_at: new Date()
        },
        create: {
          claim_id: claimId,
          total_charged: totalCharged,
          total_approved: totalApproved,
          member_owes: memberOwes,
          breakdown_json: JSON.stringify(breakdown),
          issued_at: new Date()
        }
      });

      // 4. Update Member/Dependent Annual Limits
      if (claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PARTIAL) {
        if (claim.dependent_id) {
          await prisma.dependent.update({
            where: { id: claim.dependent_id },
            data: { limit_used: { increment: totalApproved } }
          });
        }
        
        await prisma.member.update({
          where: { id: claim.member_id },
          data: { limit_used: { increment: totalApproved } }
        });
      }

      console.log(`EOB generated successfully for claim ${claimId}. Total Approved: ₹${totalApproved}`);

    } catch (error: any) {
      console.error(`EOB generation failed for ${claimId}:`, error);
      throw error;
    }
  },
  {
    connection: { url: env.REDIS_URL },
  }
);

worker.on('completed', (job) => {
  console.log(`EOB Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`EOB Job ${job?.id} failed: ${err.message}`);
});

export default worker;
