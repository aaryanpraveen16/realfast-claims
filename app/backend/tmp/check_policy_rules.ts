import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const policies = await prisma.policy.findMany();
  console.log('--- POLICIES ---');
  console.log('Total policies:', policies.length);
  policies.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));

  const rules = await prisma.coverageRule.findMany({
    include: {
      policy: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log('\n--- COVERAGE RULES ---');
  console.log('Total rules:', rules.length);
  
  const ruleMap: Record<string, string[]> = {};
  rules.forEach(r => {
    const key = `${r.policy.name} | ${r.service_type}`;
    if (!ruleMap[key]) ruleMap[key] = [];
    ruleMap[key].push(r.id);
  });

  let hasDuplicates = false;
  for (const [key, ids] of Object.entries(ruleMap)) {
    if (ids.length > 1) {
      console.log(`DUPLICATE: ${key} (${ids.length} times) - IDs: ${ids.join(', ')}`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('No duplicates found in CoverageRules by Name|Service.');
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
