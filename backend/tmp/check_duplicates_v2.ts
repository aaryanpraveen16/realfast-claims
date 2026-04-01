import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.coverageRule.groupBy({
    by: ['policy_id', 'service_type'],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  if (result.length > 0) {
    console.log(`Found ${result.length} duplicated pairs:`);
    result.forEach(r => {
      console.log(`- Policy ID: ${r.policy_id}, Service Type: ${r.service_type}, Count: ${r._count.id}`);
    });
  } else {
    console.log('No duplicates found according to groupBy.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
