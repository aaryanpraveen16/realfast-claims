import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rules = await prisma.coverageRule.findMany({
    include: {
      policy: true,
    },
  });

  console.log('Total rules:', rules.length);
  rules.forEach(r => {
    console.log(`- Policy: ${r.policy.name}, Service: ${r.service_type}, ID: ${r.id}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
