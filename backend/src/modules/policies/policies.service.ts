import { prisma } from '../../config/db';

// TODO: getCoverageRule
// Input:  policyId: string, serviceType: string
// Output: Promise<CoverageRule | null>
// Rule:   Look up coverage rule for a specific service.
export async function getCoverageRule(policyId: string, serviceType: string) {
  // TODO: Implement getCoverageRule logic
}

// TODO: getPolicy
// Input:  policyId: string
// Output: Promise<Policy | null>
// Rule:   Fetch policy by ID.
export async function getPolicy(id: string) {
  // TODO: Implement getPolicy logic
}
