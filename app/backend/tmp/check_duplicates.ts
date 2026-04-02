import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rules = await prisma.coverageRule.findMany({
    orderBy: {
      policy_id: 'asc',
    },
  });

  const duplicates: any[] = [];
  const seenEntities = new Set<string>();

  for (const rule of rules) {
    const key = `${rule.policy_id}-${rule.service_type}`;
    if (seenEntities.has(key)) {
      duplicates.push(rule);
    } else {
      seenEntities.add(key);
    }
  }

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate rules:`);
    duplicates.forEach(d => {
      console.log(`- Policy ID: ${d.policy_id}, Service Type: ${d.service_type}, ID: ${d.id}`);
    });
  } else {
    console.log('No duplicates found.');
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
