export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  deductions: number;
  status: 'draft' | 'processed' | 'locked';
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
  id: string;
  employee_id: string;
  basic_salary: number;
  hra: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  pf_amount?: number;
  esi_amount?: number;
  tax_amount?: number;
}

export interface Payslip {
  id: string;
  payroll_id: string;
  employee_id: string;
  employee_name?: string;
  month: number;
  year: number;
  generated_at: string;
  gross_salary: number;
  net_salary: number;
  deductions: number;
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
