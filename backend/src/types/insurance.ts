export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  description?: string;
  premium_amount: number;
  coverage_type: 'health' | 'life' | 'disability' | 'dental' | 'vision';
  enrollment_start_date: Date;
  enrollment_end_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInsurancePlanDTO {
  name: string;
  provider: string;
  description?: string;
  premium_amount: number;
  coverage_type: 'health' | 'life' | 'disability' | 'dental' | 'vision';
  enrollment_start_date: Date;
  enrollment_end_date: Date;
}

export interface UpdateInsurancePlanDTO {
  name?: string;
  provider?: string;
  description?: string;
  premium_amount?: number;
  coverage_type?: 'health' | 'life' | 'disability' | 'dental' | 'vision';
  enrollment_start_date?: Date;
  enrollment_end_date?: Date;
  is_active?: boolean;
}

export interface InsuranceEnrollment {
  id: string;
  employee_id: string;
  insurance_plan_id: string;
  enrollment_date: Date;
  effective_from: Date;
  effective_to: Date | undefined;
  status: 'active' | 'inactive' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface CreateInsuranceEnrollmentDTO {
  employee_id: string;
  insurance_plan_id: string;
  enrollment_date: Date;
  effective_from: Date;
}

export interface UpdateInsuranceEnrollmentDTO {
  status?: 'active' | 'inactive' | 'cancelled';
  effective_to?: Date;
}

export interface EnrollmentWindowValidation {
  isValid: boolean;
  reason?: string;
}
