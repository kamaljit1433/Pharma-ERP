export interface SalaryComponent {
  name: string;
  type: 'earning' | 'deduction';
  amount: number;
  isPercentage: boolean;
  isStatutory: boolean;
}

export interface SalaryStructure {
  id: string;
  employee_id: string;
  salary_mode: 'monthly' | 'daily' | 'hourly';
  base_salary: number;
  hra: number;
  dearness_allowance: number;
  other_allowances: number;
  pf_contribution_rate: number;
  esi_contribution_rate: number;
  professional_tax: number;
  deductions?: Record<string, number>;
  effective_from: Date;
  effective_to?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SalaryStructureRevision {
  id: string;
  salary_structure_id: string;
  employee_id: string;
  previous_salary: number;
  new_salary: number;
  effective_from: Date;
  reason: string;
  created_by: string;
  created_at: Date;
}

export interface CreateSalaryStructureDTO {
  employee_id: string;
  salary_mode: 'monthly' | 'daily' | 'hourly';
  base_salary: number;
  hra: number;
  dearness_allowance: number;
  other_allowances: number;
  pf_contribution_rate: number;
  esi_contribution_rate: number;
  professional_tax: number;
  deductions?: Record<string, number>;
  effective_from: Date;
}

export interface UpdateSalaryStructureDTO {
  base_salary?: number;
  hra?: number;
  dearness_allowance?: number;
  other_allowances?: number;
  pf_contribution_rate?: number;
  esi_contribution_rate?: number;
  professional_tax?: number;
  deductions?: Record<string, number>;
  effective_to?: Date;
}

export interface Payroll {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  total_deductions: number;
  total_earnings: number;
  status: 'draft' | 'processed' | 'paid' | 'locked';
  processed_by?: string;
  processed_at?: Date;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PayrollCalculation {
  employee_id: string;
  month: number;
  year: number;
  paid_days: number;
  total_working_days: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
}

export interface Payslip {
  id: string;
  payroll_id: string;
  employee_id: string;
  month: number;
  year: number;
  payslip_number: string;
  file_url?: string;
  earnings?: Record<string, number>;
  deductions?: Record<string, number>;
  gross_salary: number;
  net_salary: number;
  generated_at: Date;
  created_at: Date;
}

export interface AdvanceSalaryRequest {
  id: string;
  employee_id: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'deducted';
  approved_by?: string;
  approval_notes?: string;
  approved_at?: Date;
  deduction_months: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdvanceSalaryDTO {
  employee_id: string;
  amount: number;
  reason?: string;
  deduction_months?: number;
}

export interface PayrollSummary {
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  processed_count: number;
  pending_count: number;
  failed_employees?: Array<{ employeeId: string; reason: string }>;
  month: number;
  year: number;
}
