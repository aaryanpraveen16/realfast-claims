import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicates in CoverageRule...');
  
  const rules = await prisma.coverageRule.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const rule of rules) {
    const key = `${rule.policy_id}-${rule.service_type}`;
    if (seen.has(key)) {
      toDelete.push(rule.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Found ${toDelete.length} duplicates. Deleting...`);
    await prisma.coverageRule.deleteMany({
      where: {
        id: {
          in: toDelete,
        },
      },
    });
    console.log('Cleanup complete.');
  } else {
    console.log('No duplicates found.');
  }

  // Also check for duplicate policies
  console.log('Cleaning up duplicate Policies by name...');
  const policies = await prisma.policy.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  const seenPolicies = new Set<string>();
  const toDeletePolicies: string[] = [];

  for (const policy of policies) {
    if (seenPolicies.has(policy.name)) {
      toDeletePolicies.push(policy.id);
    } else {
      seenPolicies.add(policy.name);
    }
  }

  if (toDeletePolicies.length > 0) {
    console.log(`Found ${toDeletePolicies.length} duplicate policies. Deleting...`);
    // Delete related rules first if they exist (though cascade should handle it)
    await prisma.coverageRule.deleteMany({
      where: {
        policy_id: { in: toDeletePolicies }
      }
    });

    await prisma.policy.deleteMany({
      where: {
        id: {
          in: toDeletePolicies,
        },
      },
    });
    console.log('Policy cleanup complete.');
  } else {
    console.log('No duplicate policies found.');
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
