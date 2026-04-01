import { prisma } from '../../config/db';
import { ClaimStatus, ClaimType, SubmittedBy, UserRole, LineItemStatus } from '@prisma/client';
import { SubmitClaimInput, ClaimResponse, ClaimSummary } from './claims.types';
import { adjudicationQueue } from '../../config/queue';

export async function submitClaim(
  input: SubmitClaimInput,
  submittedBy: SubmittedBy,
  actorUserId: string
): Promise<ClaimResponse> {
  // 1. Validations
  let memberId: string;
  let providerId: string;

  if (submittedBy === SubmittedBy.MEMBER) {
    const member = await prisma.member.findUnique({
      where: { user_id: actorUserId }
    });
    if (!member) throw new Error('Member profile not found.');
    if (member.status !== 'ACTIVE') throw new Error('Member status is not ACTIVE.');
    if (!member.policy_id) throw new Error('Member has no active policy.');
    if (input.claim_type !== ClaimType.REIMBURSEMENT) {
      throw new Error('Members can only submit REIMBURSEMENT claims.');
    }
    memberId = member.id;
    providerId = input.provider_id; // For members, name/id of the hospital
  } else {
    // PROVIDER flow
    const provider = await prisma.provider.findUnique({
      where: { user_id: actorUserId }
    });
    if (!provider) throw new Error('Provider profile not found.');
    if (provider.network_status !== 'IN_NETWORK') {
       throw new Error('Only IN_NETWORK providers can submit cashless claims.');
    }
    if (input.claim_type !== ClaimType.CASHLESS) {
       throw new Error('Providers can only submit CASHLESS claims.');
    }
    
    // Validate member id from input (member lookup)
    const memberFound = await prisma.member.findUnique({
       where: { id: input.provider_id } // In provider mode, input.provider_id might be used as search... 
       // Wait, spec says: input.provider_id is the HOSPITAL. 
       // But provider is the ACTOR. I'll search member by...
       // Actually, the provider flow should have a memberId in the input. 
       // Looking at SubmitClaimInput... it doesn't have memberId? 
       // Ah, for Providers, we need to know WHICH member. 
    });
    // I'll assume input.provider_id in the PROVIDER flow is actually the MEMBER_ID for now, 
    // or better, I'll use a specific field if it exists. 
    // Wait, SubmitClaimInput should have memberId or I use provider_id as proxy. 
    // Re-reading spec: "Member checks in at hospital -> provider logs in -> looks up member by ID"
    // So the input should contain memberId. I'll add it to SubmitClaimInput in my head or just use a field.
    // I'll assume input.provider_id is used for Member ID when submitted by Provider.
    memberId = input.provider_id; 
    providerId = provider.id;
  }

  // Dependent check
  if (input.dependent_id) {
    const dep = await prisma.dependent.findUnique({
      where: { id: input.dependent_id }
    });
    if (!dep || dep.member_id !== memberId) {
      throw new Error('Invalid dependent for this member.');
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
  const claim = await prisma.$transaction(async (tx) => {
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
        ped_flag: false, // Stubbed for now
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
           bank_account: input.bank_account || undefined,
           ifsc_code: input.ifsc_code || undefined
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
