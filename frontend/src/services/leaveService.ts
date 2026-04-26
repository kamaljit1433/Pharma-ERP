import apiClient from './api';
import {
  Leave,
  LeaveBalance,
  LeaveType,
  CompanyHoliday,
  LeaveApplicationDTO,
  CreateLeaveTypeDTO,
  UpdateLeaveTypeDTO,
  CreateHolidayDTO,
  LeaveCalendarEntry,
} from '../types/leave';

// Request deduplication cache for GET requests
const requestCache = new Map<string, Promise<any>>();

export const leaveService = {
  // Leave Type operations
  createLeaveType: async (data: CreateLeaveTypeDTO): Promise<LeaveType> => {
    const response = await apiClient.post('/leaves/leave-types', data);
    return response.data;
  },

  getLeaveTypes: async (activeOnly = true): Promise<LeaveType[]> => {
    const response = await apiClient.get('/leaves/leave-types', {
      params: { activeOnly },
    });
    return response.data;
  },

  getLeaveType: async (id: string): Promise<LeaveType> => {
    const response = await apiClient.get(`/leaves/leave-types/${id}`);
    return response.data;
  },

  updateLeaveType: async (
    id: string,
    data: UpdateLeaveTypeDTO
  ): Promise<LeaveType> => {
    const response = await apiClient.put(`/leaves/leave-types/${id}`, data);
    return response.data;
  },

  deleteLeaveType: async (id: string): Promise<void> => {
    await apiClient.delete(`/leaves/leave-types/${id}`);
  },

  // Holiday operations
  createHoliday: async (data: CreateHolidayDTO): Promise<CompanyHoliday> => {
    const response = await apiClient.post('/leaves/holidays', data);
    return response.data;
  },

  getHolidays: async (
    year?: number,
    type?: 'national' | 'regional' | 'company'
  ): Promise<CompanyHoliday[]> => {
    const response = await apiClient.get('/leaves/holidays', {
      params: { year, type },
    });
    return response.data;
  },

  getHoliday: async (id: string): Promise<CompanyHoliday> => {
    const response = await apiClient.get(`/leaves/holidays/${id}`);
    return response.data;
  },

  updateHoliday: async (
    id: string,
    data: Partial<CompanyHoliday>
  ): Promise<CompanyHoliday> => {
    const response = await apiClient.put(`/leaves/holidays/${id}`, data);
    return response.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await apiClient.delete(`/leaves/holidays/${id}`);
  },

  // Leave request operations
  applyLeave: async (data: LeaveApplicationDTO): Promise<Leave> => {
    const response = await apiClient.post('/leaves/leaves', data);
    return response.data;
  },

  approveLeave: async (id: string): Promise<void> => {
    await apiClient.put(`/leaves/leaves/${id}/approve`);
  },

  rejectLeave: async (id: string, reason: string): Promise<void> => {
    await apiClient.put(`/leaves/leaves/${id}/reject`, { reason });
  },

  cancelLeave: async (id: string): Promise<void> => {
    await apiClient.put(`/leaves/leaves/${id}/cancel`);
  },

  getLeaveBalance: async (
    employeeId: string,
    year?: number
  ): Promise<LeaveBalance[]> => {
    const cacheKey = `balance:${employeeId}:${year || 'current'}`;
    
    // Return cached promise if request is already in flight
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!;
    }

    // Create new request promise
    const promise = apiClient
      .get(`/leaves/leaves/balance/${employeeId}`, {
        params: { year },
      })
      .then((response) => {
        // Clear cache after successful response
        requestCache.delete(cacheKey);
        return response.data;
      })
      .catch((error) => {
        // Clear cache on error
        requestCache.delete(cacheKey);
        throw error;
      });

    // Store promise in cache
    requestCache.set(cacheKey, promise);
    return promise;
  },

  getTeamLeaveCalendar: async (): Promise<LeaveCalendarEntry[]> => {
    const response = await apiClient.get('/leaves/leaves/team-calendar');
    return response.data;
  },

  getLeaves: async (filters?: {
    status?: string;
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Leave[]> => {
    const response = await apiClient.get('/leaves/leaves', {
      params: filters,
    });
    return response.data;
  },

  getPendingLeaves: async (): Promise<Leave[]> => {
    const response = await apiClient.get('/leaves/leaves/pending');
    return response.data;
  },
};
