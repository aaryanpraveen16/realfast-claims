export interface UpdateMemberInput {
  name?: string;
  phone?: string;
}

export interface CreateDependentInput {
  name: string;
  dob: string;
  relationship: string;
  aadhaar_hash: string;
}
