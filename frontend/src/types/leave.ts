export interface LeaveType {
  id: string;
  name: string;
  code: string;
  annual_limit: number;
  is_paid: boolean;
  requires_approval: boolean;
  carry_forward_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name?: string;
  year: number;
  opening_balance: number;
  used_balance: number;
  carry_forward_balance: number;
  available_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  leave_type_name?: string;
  from_date: string;
  to_date: string;
  days_count: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approval_notes?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  holiday_date: string;
  type: 'national' | 'regional' | 'company';
  is_optional: boolean;
  created_at: string;
}

export interface LeaveApplicationDTO {
  employee_id: string;
  leave_type_id: string;
  from_date: string;
  to_date: string;
  reason?: string;
}

export interface CreateLeaveTypeDTO {
  name: string;
  code: string;
  annual_limit: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  carry_forward_limit?: number;
}

export interface UpdateLeaveTypeDTO {
  name?: string;
  annual_limit?: number;
  is_paid?: boolean;
  requires_approval?: boolean;
  carry_forward_limit?: number;
  is_active?: boolean;
}

export interface CreateHolidayDTO {
  name: string;
  holiday_date: string;
  type: 'national' | 'regional' | 'company';
  is_optional?: boolean;
}

export interface LeaveCalendarEntry {
  employee_id: string;
  employee_name: string;
  from_date: string;
  to_date: string;
  leave_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}
