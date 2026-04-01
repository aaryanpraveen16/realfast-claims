
export interface RatingRequest {
  relationship: string;
  dob: string;
  hasMedicalConditions: boolean;
}

export interface RatingResult {
  basePremium: number;
  loadingAmount: number;
  totalPremium: number;
  requiresManualUnderwriting: boolean;
}

export function calculateDependentPremium(request: RatingRequest): RatingResult {
  const birthDate = new Date(request.dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Base Premiums
  let basePremium = 2000; // Default (Child)
  if (request.relationship === 'SPOUSE') basePremium = 3000;
  if (request.relationship === 'FATHER' || request.relationship === 'MOTHER') basePremium = 4500;

  let loadingAmount = 0;
  let requiresManualUnderwriting = false;

  // Rule: Age 55+ requires manual underwriting
  if (age >= 55) {
    requiresManualUnderwriting = true;
    loadingAmount += basePremium * 0.5; // 50% age loading
  }

  // Rule: Medical conditions require manual underwriting
  if (request.hasMedicalConditions) {
    requiresManualUnderwriting = true;
    loadingAmount += basePremium * 0.25; // 25% medical loading
  }

  return {
    basePremium,
    loadingAmount,
    totalPremium: basePremium + loadingAmount,
    requiresManualUnderwriting,
  };
}
