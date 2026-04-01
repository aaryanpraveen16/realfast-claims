/**
 * Chronic Disease ICD-10 Mapping
 * Used for automated PED (Pre-Existing Disease) detection.
 */

export const CHRONIC_ICD_PREFIXES: Record<string, string> = {
  'I10': 'Hypertension',
  'I11': 'Hypertensive heart disease',
  'E11': 'Type 2 diabetes mellitus',
  'E10': 'Type 1 diabetes mellitus',
  'J45': 'Asthma',
  'I25': 'Chronic ischemic heart disease',
  'E78': 'High cholesterol (Dyslipidemia)',
  'G43': 'Migraine',
  'M15': 'Osteoarthritis',
  'M16': 'Osteoarthritis of hip',
  'M17': 'Osteoarthritis of knee',
};

/**
 * Checks if an ICD-10 code represents a chronic condition.
 * matching is done by prefix (e.g. I10 covers I10.1, I10.2 etc)
 */
export function isChronicCondition(icdCode: string): { isChronic: boolean; category?: string } {
  const prefix = icdCode.split('.')[0].toUpperCase();
  if (CHRONIC_ICD_PREFIXES[prefix]) {
    return { isChronic: true, category: CHRONIC_ICD_PREFIXES[prefix] };
  }
  return { isChronic: false };
}

/**
 * Keywords for scanning unstructured medical history.
 */
export const CHRONIC_KEYWORDS = [
  'diabetes', 'sugar', 'hypertension', 'bp', 'blood pressure',
  'asthma', 'heart', 'cardiac', 'cholesterol', 'thyroid',
  'arthritis', 'joint pain', 'back pain', 'migraine'
];
