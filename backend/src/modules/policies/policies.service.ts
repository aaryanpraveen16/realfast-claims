import { prisma } from '../../config/db';

// TODO: getCoverageRule
// Input:  policyId: string, serviceType: string
// Output: Promise<CoverageRule | null>
// Rule:   Look up coverage rule for a specific service.
export async function getCoverageRule(policyId: string, serviceType: string) {
  return prisma.coverageRule.findFirst({
    where: { policy_id: policyId, service_type: serviceType }
  });
}

// Rule:   Fetch policy by ID.
export async function getPolicy(id: string) {
  return prisma.policy.findUnique({
    where: { id },
    include: { coverage_rules: true }
  });
}

// Rule:   List all available policies with their coverage rules.
export async function listAllPolicies() {
  return prisma.policy.findMany({
    include: { coverage_rules: true }
  });
}

