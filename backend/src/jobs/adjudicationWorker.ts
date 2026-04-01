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
const worker = new Worker(
  'adjudication',
  async (job: Job<{ claimId: string }>) => {
    const { claimId } = job.data;
    console.log(`Processing adjudication for claim: ${claimId}`);
    
    // Rule: Move to UNDER_REVIEW when picked up
    await prisma.claim.update({
      where: { id: claimId },
      data: { status: 'UNDER_REVIEW' }
    });

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Claim ${claimId} is now UNDER_REVIEW`);
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
