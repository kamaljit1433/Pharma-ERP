import apiClient from './api';

// Types
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  check_in_location?: GeoLocation;
  check_out_location?: GeoLocation;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MarkAttendanceDTO {
  employee_id: string;
  type: 'check_in' | 'check_out';
  location?: GeoLocation;
  mode?: 'web' | 'gps' | 'biometric';
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  on_leave_days: number;
  late_arrivals: number;
  average_working_hours: number;
}

export interface RegularizationRequest {
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  reason: string;
}

export interface AttendanceFilters {
  employee_id?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Attendance Service
 * Handles all attendance-related API calls
 */
const attendanceService = {
  /**
   * Mark attendance (check-in or check-out)
   */
  markAttendance: async (data: MarkAttendanceDTO): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },

  /**
   * Get attendance records with filters
   */
  getRecords: async (filters?: AttendanceFilters, signal?: AbortSignal): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get('/attendance', {
      params: filters,
      signal,
    });
    return response.data;
  },

  /**
   * Get attendance record by ID
   */
  getById: async (id: string): Promise<AttendanceRecord> => {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Get current attendance status for an employee
   */
  getCurrentStatus: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const response = await apiClient.get(`/attendance/current/${employeeId}`);
    return response.data;
  },

  /**
   * Get attendance statistics
   */
  getStats: async (employeeId: string, fromDate?: string, toDate?: string): Promise<AttendanceStats> => {
    const response = await apiClient.get(`/attendance/stats/${employeeId}`, {
      params: { from_date: fromDate, to_date: toDate },
    });
    return response.data;
  },

  /**
   * Request attendance regularization
   */
  requestRegularization: async (data: RegularizationRequest): Promise<{ id: string; message: string }> => {
    const response = await apiClient.post('/attendance/regularization', data);
    return response.data;
  },

  /**
   * Get team attendance (for managers)
   */
  getTeamAttendance: async (date?: string, signal?: AbortSignal): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get('/attendance/team', {
      params: { date },
      signal,
    });
    return response.data;
  },

  /**
   * Export attendance records
   */
  exportRecords: async (filters?: AttendanceFilters): Promise<Blob> => {
    const response = await apiClient.get('/attendance/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default attendanceService;
