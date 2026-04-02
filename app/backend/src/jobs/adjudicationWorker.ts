import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { runRulesEngine } from '../modules/adjudication/rulesEngine';

// TODO: adjudicationWorker
// Input:  job: Job<{ claimId: string }>
// Output: Promise<void>
// Rule:   Process claims by running each line item through the rules engine.
// Calls:  runRulesEngine, prisma.claim.findUnique, transitionClaim
// Edge:   If rules fail due to data inconsistency, move to FAILED but retry 3 times.
import { eobQueue } from '../config/queue';

const worker = new Worker(
  'adjudication',
  async (job: Job<{ claimId: string }>) => {
    const { claimId } = job.data;
    console.log(`Processing adjudication for claim: ${claimId}`);
    
    try {
      // 1. Initial State Update
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'UNDER_REVIEW' }
      });

      // 2. Run Engine
      const finalStatus = await runRulesEngine(claimId);
      console.log(`Claim ${claimId} auto-adjudicated with status: ${finalStatus}`);

      // 3. Hand-off to EOB generation if fully processed (not manual)
      if (finalStatus !== 'UNDER_REVIEW') {
        await eobQueue.add('generate_eob', { claimId });
        console.log(`Enqueued EOB generation for claim ${claimId}`);
      }
    } catch (error: any) {
      console.error(`Adjudication failed for ${claimId}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: { url: env.REDIS_URL },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`${job?.id} has failed with ${err.message}`);
});

export default worker;
