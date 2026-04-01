import { ClaimStatus, ClaimType, SubmittedBy } from '@prisma/client';

export interface CreateClaimInput {
  member_id: string;
  dependent_id?: string;
  provider_id: string;
  claim_type: ClaimType;
  diagnosis_code: string;
  ped_flag: boolean;
  submitted_by: SubmittedBy;
  sla_deadline: Date;
}
