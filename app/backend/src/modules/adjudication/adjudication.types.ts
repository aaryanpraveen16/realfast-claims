export interface AdjudicationInput {
  line_item_id: string;
  is_covered: boolean;
  approved_amount: number;
  member_owes: number;
  denial_reason_en?: string;
  denial_reason_hi?: string;
}
