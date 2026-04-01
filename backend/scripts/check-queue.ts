import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

async function checkQueues() {
  const queues = ['adjudication', 'sla', 'eob'];
  
  console.log('\n--- 🚀 REDIS QUEUE STATUS ---');
  
  for (const name of queues) {
    const queue = new Queue(name, { connection });
    const counts = await queue.getJobCounts();
    
    console.log(`\nQueue: ${name.toUpperCase()}`);
    console.log(`- Waiting:   ${counts.waiting}`);
    console.log(`- Active:    ${counts.active}`);
    console.log(`- Completed: ${counts.completed}`);
    console.log(`- Failed:    ${counts.failed}`);
    console.log(`- Delayed:   ${counts.delayed}`);
    
    await queue.close();
  }
  
  console.log('\n-----------------------------\n');
  process.exit(0);
}

checkQueues().catch((err) => {
  console.error('Failed to connect to Redis:', err.message);
  process.exit(1);
});
