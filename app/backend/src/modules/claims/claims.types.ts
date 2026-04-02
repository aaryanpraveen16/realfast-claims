import { ClaimStatus, ClaimType, SubmittedBy, LineItemStatus } from '@prisma/client';

export enum ServiceType {
  DOCTOR_VISIT = 'DOCTOR_VISIT',
  MRI_SCAN = 'MRI_SCAN',
  BLOOD_TEST = 'BLOOD_TEST',
  SURGERY = 'SURGERY',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  ROOM_RENT = 'ROOM_RENT',
  MEDICINE = 'MEDICINE',
  AMBULANCE = 'AMBULANCE'
}

export interface SubmitClaimInput {
  claim_type: ClaimType;
  diagnosis_code: string;
  dependent_id?: string;
  provider_id: string;
  date_of_visit: string; // ISO string
  admission_date?: string;
  discharge_date?: string;
  bank_account?: string;
  ifsc_code?: string;
  line_items: {
    procedure_code: string;
    service_type: string;
    service_date: string; // ISO string
    charged_amount: number;
    description?: string;
  }[];
  documents?: string[];
}

export interface ClaimResponse {
  id: string;
  status: ClaimStatus;
  claim_type: ClaimType;
  submitted_by: SubmittedBy;
  member_name: string;
  dependent_name?: string;
  provider_name: string;
  diagnosis_code: string;
  date_of_visit: Date;
  sla_deadline: Date;
  line_items: {
    id: string;
    service_type: string;
    procedure_code: string;
    charged_amount: number;
    status: LineItemStatus;
  }[];
  total_charged: number;
}

export interface ClaimSummary {
  id: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  submitted_at: Date;
  total_charged: number;
  provider_name: string;
  sla_deadline: Date;
}
