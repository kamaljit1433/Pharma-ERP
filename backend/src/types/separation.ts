/**
 * Separation & Offboarding Module Types
 * Handles resignation, termination, exit interviews, F&F settlement, and asset recovery
 */

// Resignation
export interface Resignation {
  id: string;
  employee_id: string;
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  accepted_by?: string;
  accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateResignationDTO {
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
}

export interface UpdateResignationDTO {
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  last_working_day?: Date;
  reason?: string;
}

// Termination
export interface Termination {
  id: string;
  employee_id: string;
  termination_date: Date;
  reason: string;
  status: 'pending' | 'approved' | 'completed';
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTerminationDTO {
  termination_date: Date;
  reason: string;
}

// Exit Interview Questionnaire Template
export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionnaireQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  is_required: boolean;
  order: number;
}

export interface CreateQuestionnaireTemplateDTO {
  name: string;
  description?: string;
  questions: Omit<QuestionnaireQuestion, 'id'>[];
}

export interface UpdateQuestionnaireTemplateDTO {
  name?: string;
  description?: string;
  questions?: Omit<QuestionnaireQuestion, 'id'>[];
  is_active?: boolean;
}

// Exit Interview
export interface ExitInterview {
  id: string;
  employee_id: string;
  questionnaire_template_id?: string;
  conducted_by?: string;
  scheduled_at?: Date;
  conducted_at?: Date;
  questionnaire_responses?: Record<string, any>;
  feedback?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface CreateExitInterviewDTO {
  scheduled_at: Date;
  questionnaire_template_id?: string | undefined;
}

export interface UpdateExitInterviewDTO {
  conducted_by?: string;
  conducted_at?: Date;
  questionnaire_responses?: Record<string, any>;
  feedback?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

// Full & Final Settlement
export interface FnFSettlement {
  id: string;
  employee_id: string;
  pending_salary: number;
  leave_encashment: number;
  gratuity: number;
  bonus: number;
  other_benefits: number;
  total_earnings: number;
  advance_deduction: number;
  asset_damage_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_settlement: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFnFSettlementDTO {
  pending_salary?: number;
  leave_encashment?: number;
  gratuity?: number;
  bonus?: number;
  other_benefits?: number;
  advance_deduction?: number;
  asset_damage_deduction?: number;
  other_deductions?: number;
}

export interface UpdateFnFSettlementDTO {
  status?: 'draft' | 'pending_approval' | 'approved' | 'paid';
  pending_salary?: number;
  leave_encashment?: number;
  gratuity?: number;
  bonus?: number;
  other_benefits?: number;
  advance_deduction?: number;
  asset_damage_deduction?: number;
  other_deductions?: number;
}

// Asset Recovery
export interface AssetRecoveryChecklist {
  id: string;
  employee_id: string;
  asset_id: string;
  status: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAssetRecoveryDTO {
  asset_id: string;
  status?: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
}

export interface UpdateAssetRecoveryDTO {
  status?: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
}

// Offboarding Checklist
export interface OffboardingChecklist {
  id: string;
  employee_id: string;
  resignation_id?: string;
  termination_id?: string;
  exit_interview_completed: boolean;
  fnf_settlement_approved: boolean;
  assets_recovered: boolean;
  system_access_revoked: boolean;
  data_archived: boolean;
  status: 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

// Notice Period Calculation
export interface NoticePeriodInfo {
  notice_period_days: number;
  notice_period_end_date: Date;
  notice_period_served_days: number;
  notice_period_remaining_days: number;
  is_notice_period_complete: boolean;
}
