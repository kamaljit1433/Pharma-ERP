// PF (Provident Fund) Types
export interface PFContribution {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  employee_contribution_rate: number;
  employer_contribution_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface PFAccount {
  id: string;
  employee_id: string;
  pf_account_number: string;
  opening_balance: number;
  current_balance: number;
  total_contributions: number;
  last_contribution_date?: Date | undefined;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePFContributionDTO {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution_rate: number;
  employer_contribution_rate: number;
}

export interface PFStatement {
  employee_id: string;
  employee_name: string;
  pf_account_number: string;
  opening_balance: number;
  contributions: PFContribution[];
  closing_balance: number;
  total_employee_contribution: number;
  total_employer_contribution: number;
  period_from: Date;
  period_to: Date;
}

// Gratuity Types
export interface Gratuity {
  id: string;
  employee_id: string;
  eligibility_date: Date;
  years_of_service: number;
  last_drawn_salary: number;
  gratuity_amount: number;
  is_eligible: boolean;
  calculation_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGratuityDTO {
  employee_id: string;
  last_drawn_salary: number;
}

export interface GratuityReport {
  employee_id: string;
  employee_name: string;
  employee_id_number: string;
  date_of_joining: Date;
  date_of_separation?: Date | undefined;
  years_of_service: number;
  is_eligible: boolean;
  last_drawn_salary: number;
  gratuity_amount: number;
  calculation_date: Date;
  remarks?: string;
}

export interface BenefitsReport {
  employee_id: string;
  employee_name: string;
  pf_account_number?: string;
  pf_balance: number;
  gratuity_eligible: boolean;
  gratuity_amount: number;
  total_benefits: number;
  report_date: Date;
}

// Reimbursement Types
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface ReimbursementClaim {
  id: string;
  employee_id: string;
  claim_type: string;
  amount: number;
  description: string;
  receipt_url?: string | null;
  status: ReimbursementStatus;
  approved_by?: string | null;
  approval_notes?: string | null;
  approved_at?: Date | null;
  paid_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReimbursementClaimDTO {
  employee_id: string;
  claim_type: string;
  amount: number;
  description: string;
  receipt_url?: string;
}

export interface UpdateReimbursementClaimDTO {
  claim_type?: string;
  amount?: number;
  description?: string;
  receipt_url?: string;
}

export interface ApproveReimbursementClaimDTO {
  approved_by: string;
  approval_notes?: string;
}

export interface RejectReimbursementClaimDTO {
  approved_by: string;
  approval_notes: string;
}

export interface ReimbursementClaimFilter {
  employee_id?: string;
  status?: ReimbursementStatus;
  claim_type?: string;
  from_date?: Date;
  to_date?: Date;
}

// Reward Types
export type RewardCategory = 'performance' | 'attendance' | 'innovation' | 'teamwork';

export interface Reward {
  id: string;
  employee_id: string;
  category: RewardCategory | string;
  title: string;
  description?: string | null;
  awarded_by?: string | null;
  awarded_date: Date;
  amount?: number;
  currency?: string;
  is_public: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateRewardDTO {
  employee_id: string;
  category: RewardCategory | string;
  title: string;
  description?: string;
  awarded_by?: string;
  awarded_date: Date;
  amount?: number;
  currency?: string;
  is_public?: boolean;
}

export interface UpdateRewardDTO {
  category?: RewardCategory | string;
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  is_public?: boolean;
}

export interface RewardNomination {
  id: string;
  employee_id: string;
  nominated_by: string;
  category: RewardCategory;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approval_notes?: string | null;
  approved_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRewardNominationDTO {
  employee_id: string;
  nominated_by: string;
  category: RewardCategory;
  title: string;
  description: string;
}

export interface ApproveRewardNominationDTO {
  approved_by: string;
  approval_notes?: string;
}

export interface RejectRewardNominationDTO {
  approved_by: string;
  approval_notes: string;
}

export interface RewardFilter {
  employee_id?: string;
  category?: RewardCategory;
  is_public?: boolean;
  from_date?: Date;
  to_date?: Date;
}
