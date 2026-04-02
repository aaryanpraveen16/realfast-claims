import { Queue } from 'bullmq';
import { env } from './env';

const connection = {
  url: env.REDIS_URL,
};

export const adjudicationQueue = new Queue('adjudication', { connection });
export const slaQueue = new Queue('sla', { connection });
export const eobQueue = new Queue('eob', { connection });
