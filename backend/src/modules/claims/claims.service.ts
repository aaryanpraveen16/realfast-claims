import { prisma } from '../../config/db';
import { ClaimStatus, ClaimType, SubmittedBy, UserRole, LineItemStatus } from '@prisma/client';
import { SubmitClaimInput, ClaimResponse, ClaimSummary } from './claims.types';
import { adjudicationQueue } from '../../config/queue';
import { isChronicCondition, CHRONIC_KEYWORDS } from '../../utils/chronicDiseases';

export async function submitClaim(
  input: SubmitClaimInput,
  submittedBy: SubmittedBy,
  actorUserId: string
): Promise<ClaimResponse> {
  // 1. Validations
  let memberId: string;
  let providerId: string;
  let medicalHistory = '';

  if (submittedBy === SubmittedBy.MEMBER) {
    const member = await prisma.member.findUnique({
      where: { user_id: actorUserId }
    });
    if (!member) throw new Error('Member profile not found.');
    if (member.status !== 'ACTIVE') throw new Error('Member status is not ACTIVE.');
    if (!member.policy_id) throw new Error('Member has no active policy.');
    
    memberId = member.id;
    providerId = input.provider_id;
    medicalHistory = (member as any).medical_conditions || '';
  } else {
    // PROVIDER flow
    const provider = await prisma.provider.findUnique({
      where: { user_id: actorUserId }
    });
    if (!provider) throw new Error('Provider profile not found.');
    
    const memberFound = await prisma.member.findUnique({
       where: { id: input.provider_id }
    });
    if (!memberFound) throw new Error('Member record not found.');
    
    memberId = memberFound.id;
    providerId = provider.id;
    medicalHistory = (memberFound as any).medical_conditions || '';
  }

  // Dependent check & History merge
  if (input.dependent_id) {
    const dep = await prisma.dependent.findUnique({
      where: { id: input.dependent_id }
    });
    if (!dep || dep.member_id !== memberId) {
      throw new Error('Invalid dependent for this member.');
    }
    medicalHistory += ` ${(dep as any).medical_conditions || ''}`;
  }

  // Automated PED Detection
  const chronicMeta = isChronicCondition(input.diagnosis_code);
  let ped_flag = chronicMeta.isChronic;

  if (!ped_flag && medicalHistory) {
    const historyLower = medicalHistory.toLowerCase();
    const hasKeyword = CHRONIC_KEYWORDS.some(k => historyLower.includes(k));
    if (hasKeyword) {
      ped_flag = true;
      console.log(`PED flag auto-set for diagnosis ${input.diagnosis_code} due to medical history match.`);
    }
  }

  if (!input.line_items || input.line_items.length === 0) {
    throw new Error('Claim must have at least one line item.');
  }

  // Pre-calculate SLA deadline
  const now = new Date();
  const sla_deadline = input.claim_type === 'CASHLESS' 
    ? new Date(now.getTime() + 1 * 60 * 60 * 1000) // 1 hour
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Transaction for atomic creation
  const claim = await (prisma as any).$transaction(async (tx: any) => {
    const createdClaim = await tx.claim.create({
      data: {
        member_id: memberId,
        dependent_id: input.dependent_id,
        provider_id: providerId,
        claim_type: input.claim_type,
        diagnosis_code: input.diagnosis_code,
        status: ClaimStatus.SUBMITTED,
        submitted_by: submittedBy,
        sla_deadline,
        ped_flag: ped_flag,
        admission_date: input.admission_date ? new Date(input.admission_date) : undefined,
        discharge_date: input.discharge_date ? new Date(input.discharge_date) : undefined,
      },
      include: {
        member: true,
        dependent: true,
        provider: true,
        line_items: true
      }
    });

    // Update Member Bank Details if provided
    if (submittedBy === SubmittedBy.MEMBER && (input.bank_account || input.ifsc_code)) {
       await tx.member.update({
         where: { id: memberId },
         data: {
           bank_account: (input as any).bank_account || undefined,
           ifsc_code: (input as any).ifsc_code || undefined
         }
       });
    }

    await tx.lineItem.createMany({
      data: input.line_items.map(item => ({
        claim_id: createdClaim.id,
        procedure_code: item.procedure_code,
        service_type: item.service_type,
        service_date: new Date(item.service_date),
        charged_amount: item.charged_amount,
        status: LineItemStatus.PENDING
      }))
    });

    return await tx.claim.findUnique({
      where: { id: createdClaim.id },
      include: {
        member: true,
        dependent: true,
        provider: true,
        line_items: true
      }
    });
  });

  if (!claim) throw new Error('Failed to create claim.');

  // 4. Queue for adjudication
  await adjudicationQueue.add('process_claim', { claimId: claim.id });

  // 5. Return response
  return mapToClaimResponse(claim);
}

export async function getClaimById(claimId: string, actorUserId: string, role: UserRole): Promise<ClaimResponse> {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      member: true,
      dependent: true,
      provider: true,
      line_items: true
    }
  });

  if (!claim) throw new Error('Claim not found.');

  // Permission checks
  if (role === UserRole.MEMBER) {
    if (claim.member.user_id !== actorUserId) throw new Error('Forbidden access to claim.');
  } else if (role === UserRole.PROVIDER) {
    if (claim.provider.user_id !== actorUserId) throw new Error('Forbidden access to claim.');
  }

  return mapToClaimResponse(claim);
}

export async function getMemberClaims(memberUserId: string): Promise<ClaimSummary[]> {
  const member = await prisma.member.findUnique({ where: { user_id: memberUserId } });
  if (!member) return [];

  const claims = await prisma.claim.findMany({
    where: { member_id: member.id },
    include: { provider: true, line_items: true },
    orderBy: { submitted_at: 'desc' }
  });

  return claims.map(c => mapToSummary(c));
}

export async function getProviderClaims(providerUserId: string): Promise<ClaimSummary[]> {
  const provider = await prisma.provider.findUnique({ where: { user_id: providerUserId } });
  if (!provider) return [];

  const claims = await prisma.claim.findMany({
    where: { provider_id: provider.id },
    include: { provider: true, line_items: true },
    orderBy: { sla_deadline: 'asc' }
  });

  return claims.map(c => mapToSummary(c));
}

// Helpers
function mapToClaimResponse(claim: any): ClaimResponse {
  return {
    id: claim.id,
    status: claim.status,
    claim_type: claim.claim_type,
    submitted_by: claim.submitted_by,
    member_name: claim.member.name,
    dependent_name: claim.dependent?.name,
    provider_name: claim.provider.name,
    diagnosis_code: claim.diagnosis_code,
    date_of_visit: claim.submitted_at, // Using submitted_at as proxy for now
    sla_deadline: claim.sla_deadline,
    line_items: claim.line_items.map((li: any) => ({
      id: li.id,
      service_type: li.service_type,
      procedure_code: li.procedure_code,
      charged_amount: li.charged_amount,
      status: li.status
    })),
    total_charged: claim.line_items.reduce((sum: number, li: any) => sum + li.charged_amount, 0)
  };
}

function mapToSummary(claim: any): ClaimSummary {
  return {
    id: claim.id,
    claim_type: claim.claim_type,
    status: claim.status,
    submitted_at: claim.submitted_at,
    total_charged: claim.line_items.reduce((sum: number, li: any) => sum + li.charged_amount, 0),
    provider_name: claim.provider.name,
    sla_deadline: claim.sla_deadline
  };
}
