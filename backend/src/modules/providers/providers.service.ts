import { prisma } from '../../config/db';
import { NetworkStatus, PlanType } from '@prisma/client';

export interface EligibilityResponse {
  is_eligible: boolean;
  reason?: string;
  member_name?: string;
  policy_name?: string;
  plan_type?: PlanType;
  annual_limit?: number;
  annual_used?: number;
  annual_remaining?: number;
  deductible?: number;
  deductible_met?: number;
  deductible_remaining?: number;
  dependents: { id: string; name: string; relationship: string }[];
  covered_services: { service_type: string; limit_per_year: number; requires_preauth: boolean }[];
  network_status: NetworkStatus;
}

export async function checkEligibility(memberId: string, providerUserId: string): Promise<EligibilityResponse> {
  const provider = await prisma.provider.findUnique({
    where: { user_id: providerUserId }
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      policy: {
        include: { coverage_rules: true }
      },
      dependents: true
    }
  });

  if (!member) {
    return { is_eligible: false, reason: 'Member not found', dependents: [], covered_services: [], network_status: provider.network_status };
  }

  if (member.status !== 'ACTIVE') {
    return { is_eligible: false, reason: 'Member status is inactive', dependents: [], covered_services: [], network_status: provider.network_status };
  }

  if (!member.policy) {
    return { is_eligible: false, reason: 'No active policy found', dependents: [], covered_services: [], network_status: provider.network_status };
  }

  const annual_limit = member.policy.annual_limit;
  const annual_used = member.limit_used;
  const annual_remaining = Math.max(0, annual_limit - annual_used);

  const deductible = member.policy.deductible;
  const deductible_met = member.deductible_met;
  const deductible_remaining = Math.max(0, deductible - deductible_met);

  return {
    is_eligible: true,
    member_name: member.name,
    policy_name: member.policy.name,
    plan_type: member.policy.plan_type,
    annual_limit,
    annual_used,
    annual_remaining,
    deductible,
    deductible_met,
    deductible_remaining,
    dependents: member.dependents.map(d => ({ id: d.id, name: d.name, relationship: d.relationship })),
    covered_services: member.policy.coverage_rules.map(r => ({
      service_type: r.service_type,
      limit_per_year: r.limit_per_year,
      requires_preauth: r.requires_preauth
    })),
    network_status: provider.network_status
  };
}

export async function getAllProviders() {
  return prisma.provider.findMany({
    select: { id: true, name: true, city: true, network_status: true }
  });
}
