import apiClient from './api';

// Types
export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by?: string;
  changes?: Record<string, any>;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeDTO {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
}

export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
  status?: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
}

export interface EmployeeFilters {
  department_id?: string;
  designation_id?: string;
  status?: string;
  employment_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Employee Service
 * Handles all employee-related API calls
 */
const employeeService = {
  /**
   * Get all employees with optional filters
   */
  getAll: async (filters?: EmployeeFilters, signal?: AbortSignal): Promise<PaginatedResponse<Employee>> => {
    const config: Record<string, unknown> = {};
    if (filters !== undefined) config['params'] = filters;
    if (signal !== undefined) config['signal'] = signal;
    const response = await apiClient.get('/employees', config);
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getById: async (id: string, signal?: AbortSignal): Promise<Employee> => {
    const config: Record<string, unknown> = {};
    if (signal !== undefined) config['signal'] = signal;
    const response = await apiClient.get(`/employees/${id}`, config);
    return response.data.data ?? response.data;
  },

  /**
   * Create new employee
   */
  create: async (data: CreateEmployeeDTO): Promise<Employee> => {
    const response = await apiClient.post('/employees', data);
    return response.data.data ?? response.data;
  },

  /**
   * Update employee
   */
  update: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data.data ?? response.data;
  },

  /**
   * Delete employee
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  /**
   * Upload employee profile photo
   */
  uploadPhoto: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.post(`/employees/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Find employees matching a search string (uses the /search endpoint which supports filtering)
   */
  search: async (query: string, limit = 10, signal?: AbortSignal): Promise<Employee[]> => {
    const config: Record<string, unknown> = { params: { search: query, limit } };
    if (signal !== undefined) config['signal'] = signal;
    const response = await apiClient.get('/employees/search', config);
    const payload = response.data;
    return payload?.data ?? (Array.isArray(payload) ? payload : []);
  },

  /**
   * Import employees from CSV
   */
  importCSV: async (file: File): Promise<{ success: number; failed: number; errors?: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Export employees — format: 'csv' | 'excel' | 'pdf'
   */
  exportEmployees: async (format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: EmployeeFilters): Promise<Blob> => {
    const response = await apiClient.get('/employees/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  getAuditLogs: async (id: string, limit = 50, offset = 0): Promise<AuditLogEntry[]> => {
    const response = await apiClient.get(`/employees/${id}/audit-logs`, {
      params: { limit, offset },
    });
    return response.data?.data ?? [];
  },

  /** @deprecated use exportEmployees instead */
  exportCSV: async (filters?: EmployeeFilters): Promise<Blob> => {
    const response = await apiClient.get('/employees/export', {
      params: { ...filters, format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default employeeService;
