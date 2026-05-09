export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary?: number;
  gross_salary: number;
  net_salary: number;
  total_deductions: number;
  pf_deduction?: number;
  esi_deduction?: number;
  tds_deduction?: number;
  status: 'draft' | 'processed' | 'paid' | 'locked';
  processed_by?: string;
  processed_at?: string;
  paid_at?: string | null;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface SalaryStructure {
  id?: string;
  structure_id?: string;
  employee_id?: string;
  employee_uuid?: string;
  employee_code?: string;
  employee_name?: string;
  salary_mode?: 'monthly' | 'daily' | 'hourly';
  base_salary?: number;
  hra?: number;
  dearness_allowance?: number;
  other_allowances?: number;
  pf_contribution_rate?: number;
  esi_contribution_rate?: number;
  professional_tax?: number;
  effective_from?: string;
  is_active?: boolean;
}

export interface Payslip {
  id: string;
  payroll_id: string;
  employee_id: string;
  employee_name?: string;
  payslip_number?: string;
  month: number;
  year: number;
  generated_at: string;
  gross_salary: number;
  net_salary: number;
  total_deductions?: number;
  earnings?: Record<string, number>;
  deductions_breakdown?: Record<string, number>;
}

export interface PayrollSummary {
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  processed_count: number;
  pending_count: number;
  month: number;
  year: number;
}

export interface PayrollFilters {
  month?: number;
  year?: number;
  employee_id?: string;
  status?: 'draft' | 'processed' | 'locked';
}

export interface SalaryAdjustment {
  id?: string;
  payroll_id: string;
  employee_id: string;
  component_name: string;
  amount: number;
  reason: string;
  type: 'earning' | 'deduction';
}

export interface PayslipGenerationRequest {
  employee_ids: string[];
  month: number;
  year: number;
}
