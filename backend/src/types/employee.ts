export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  pan?: string;
  aadhar?: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  date_of_exit?: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  profile_photo_url?: string;
  notice_period_days?: number;
  archived_at?: string;
  archive_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  employee_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface EmploymentHistory {
  id: string;
  employee_id: string;
  designation_id?: string;
  department_id?: string;
  from_date: string;
  to_date?: string;
  reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateEmploymentHistoryDTO {
  designation_id?: string;
  department_id?: string;
  from_date: string;
  to_date?: string;
  reason?: string;
}

export interface CreateEmployeeDTO {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  pan?: string;
  aadhar?: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
}

export interface UpdateEmployeeDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  pan?: string;
  aadhar?: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  profile_photo_url?: string;
  notice_period_days?: number;
}

export interface EmployeeFilters {
  department_id?: string;
  designation_id?: string;
  status?: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  employment_type?: 'permanent' | 'contract' | 'temporary' | 'intern';
  search?: string;
  limit?: number;
  offset?: number;
  reporting_manager_id?: string;
}

export interface CreateEmergencyContactDTO {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  priority?: number;
}

export interface UpdateEmergencyContactDTO {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  priority?: number;
}
