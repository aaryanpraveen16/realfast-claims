import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { runRulesEngine } from '../modules/adjudication/rulesEngine';

// TODO: adjudicationWorker
// Input:  job: Job<{ claimId: string }>
// Output: Promise<void>
// Rule:   Process claims by running each line item through the rules engine.
// Calls:  runRulesEngine, prisma.claim.findUnique, transitionClaim
// Edge:   If rules fail due to data inconsistency, move to FAILED but retry 3 times.
const worker = new Worker(
  'adjudication',
  async (job: Job) => {
    // TODO: Implement adjudication logic (Rules Engine call)
    console.log(`Processing adjudication for claim: ${job.data.claimId}`);
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
