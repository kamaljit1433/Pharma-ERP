/**
 * Attendance Store Tests
 * Tests for Zustand state management and store actions
 * 
 * Requirements Tested:
 * - 19.1: Use Zustand for state management
 * - 19.4: Maintain separate stores for each major feature
 * - 19.5: Provide actions for fetching, creating, updating, deleting data
 * - 19.7: Handle loading and error states for async operations
 * - 19.8: Implement optimistic updates for better user experience
 * - 30.2: Test store actions and state updates
 * - 30.3: Test error handling in store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAttendanceStore } from '../attendanceStore';
import attendanceService, {
  AttendanceRecord,
  MarkAttendanceDTO,
  AttendanceStats,
  RegularizationRequest,
  AttendanceFilters,
} from '../../services/attendanceService';

// Mock the attendance service
vi.mock('../../services/attendanceService', () => ({
  default: {
    markAttendance: vi.fn(),
    getRecords: vi.fn(),
    getCurrentStatus: vi.fn(),
    getStats: vi.fn(),
    requestRegularization: vi.fn(),
    getTeamAttendance: vi.fn(),
    exportRecords: vi.fn(),
  },
}));

describe('Attendance Store', () => {
  const mockEmployeeId = 'emp-123';
  const mockDate = '2024-01-15';

  const mockAttendanceRecord: AttendanceRecord = {
    id: 'att-001',
    employee_id: mockEmployeeId,
    date: mockDate,
    check_in_time: '2024-01-15T09:00:00Z',
    check_out_time: '2024-01-15T17:30:00Z',
    working_hours: 8.5,
    status: 'present',
    check_in_location: {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
    },
  };

  const mockAttendanceStats: AttendanceStats = {
    total_days: 20,
    present_days: 18,
    absent_days: 1,
    half_days: 1,
    on_leave_days: 0,
    late_arrivals: 3,
    average_working_hours: 8.2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAttendanceStore());

      expect(result.current.records).toEqual([]);
      expect(result.current.currentStatus).toBeNull();
      expect(result.current.stats).toBeNull();
      expect(result.current.teamRecords).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('markAttendance', () => {
    it('should mark attendance and update current status', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_in',
        mode: 'web',
      };

      vi.mocked(attendanceService.markAttendance).mockResolvedValue(mockAttendanceRecord);
      vi.mocked(attendanceService.getRecords).mockResolvedValue([mockAttendanceRecord]);

      await act(async () => {
        await result.current.markAttendance(markData);
      });

      expect(result.current.currentStatus).toEqual(mockAttendanceRecord);
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state while marking attendance', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_in',
        mode: 'web',
      };

      vi.mocked(attendanceService.markAttendance).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      act(() => {
        result.current.markAttendance(markData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
    });

    it('should handle GPS check-in with location', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_in',
        mode: 'gps',
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      vi.mocked(attendanceService.markAttendance).mockResolvedValue(mockAttendanceRecord);
      vi.mocked(attendanceService.getRecords).mockResolvedValue([mockAttendanceRecord]);

      await act(async () => {
        await result.current.markAttendance(markData);
      });

      expect(result.current.currentStatus?.check_in_location).toBeDefined();
    });

    it('should handle check-out', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const checkOutRecord = {
        ...mockAttendanceRecord,
        check_out_time: '2024-01-15T17:30:00Z',
      };

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_out',
        mode: 'web',
      };

      vi.mocked(attendanceService.markAttendance).mockResolvedValue(checkOutRecord);
      vi.mocked(attendanceService.getRecords).mockResolvedValue([checkOutRecord]);

      await act(async () => {
        await result.current.markAttendance(markData);
      });

      expect(result.current.currentStatus?.check_out_time).toBeDefined();
    });

    it('should handle error during mark attendance', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_in',
        mode: 'web',
      };

      const errorMessage = 'Failed to mark attendance';
      vi.mocked(attendanceService.markAttendance).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        try {
          await result.current.markAttendance(markData);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should refresh records after marking attendance', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const markData: MarkAttendanceDTO = {
        employee_id: mockEmployeeId,
        type: 'check_in',
        mode: 'web',
      };

      vi.mocked(attendanceService.markAttendance).mockResolvedValue(mockAttendanceRecord);
      vi.mocked(attendanceService.getRecords).mockResolvedValue([mockAttendanceRecord]);

      await act(async () => {
        await result.current.markAttendance(markData);
      });

      expect(attendanceService.getRecords).toHaveBeenCalledWith({
        employee_id: mockEmployeeId,
      });
    });
  });

  describe('fetchRecords', () => {
    it('should fetch attendance records', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const filters: AttendanceFilters = {
        employee_id: mockEmployeeId,
      };

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValue(mockRecords);

      await act(async () => {
        await result.current.fetchRecords(filters);
      });

      expect(result.current.records).toEqual(mockRecords);
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state while fetching', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      vi.mocked(attendanceService.getRecords).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      act(() => {
        result.current.fetchRecords();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });
    });

    it('should handle fetch error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Failed to fetch records';
      vi.mocked(attendanceService.getRecords).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.fetchRecords();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should support pagination filters', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const filters: AttendanceFilters = {
        employee_id: mockEmployeeId,
        page: 1,
        limit: 10,
      };

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValue(mockRecords);

      await act(async () => {
        await result.current.fetchRecords(filters);
      });

      expect(attendanceService.getRecords).toHaveBeenCalledWith(filters);
    });

    it('should support date range filters', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const filters: AttendanceFilters = {
        employee_id: mockEmployeeId,
        from_date: '2024-01-01',
        to_date: '2024-01-31',
      };

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValue(mockRecords);

      await act(async () => {
        await result.current.fetchRecords(filters);
      });

      expect(attendanceService.getRecords).toHaveBeenCalledWith(filters);
    });
  });

  describe('fetchCurrentStatus', () => {
    it('should fetch current attendance status', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      vi.mocked(attendanceService.getCurrentStatus).mockResolvedValue(mockAttendanceRecord);

      await act(async () => {
        await result.current.fetchCurrentStatus(mockEmployeeId);
      });

      expect(result.current.currentStatus).toEqual(mockAttendanceRecord);
      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Failed to fetch status';
      vi.mocked(attendanceService.getCurrentStatus).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.fetchCurrentStatus(mockEmployeeId);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchStats', () => {
    it('should fetch attendance statistics', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      vi.mocked(attendanceService.getStats).mockResolvedValue(mockAttendanceStats);

      await act(async () => {
        await result.current.fetchStats(mockEmployeeId);
      });

      expect(result.current.stats).toEqual(mockAttendanceStats);
      expect(result.current.loading).toBe(false);
    });

    it('should support date range for stats', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';

      vi.mocked(attendanceService.getStats).mockResolvedValue(mockAttendanceStats);

      await act(async () => {
        await result.current.fetchStats(mockEmployeeId, fromDate, toDate);
      });

      expect(attendanceService.getStats).toHaveBeenCalledWith(mockEmployeeId, fromDate, toDate);
    });

    it('should handle fetch error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Failed to fetch stats';
      vi.mocked(attendanceService.getStats).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.fetchStats(mockEmployeeId);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('requestRegularization', () => {
    it('should submit regularization request', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const regularizationData: RegularizationRequest = {
        employee_id: mockEmployeeId,
        date: mockDate,
        reason: 'System was down',
      };

      vi.mocked(attendanceService.requestRegularization).mockResolvedValue({
        id: 'reg-001',
        message: 'Request submitted',
      });

      await act(async () => {
        await result.current.requestRegularization(regularizationData);
      });

      expect(attendanceService.requestRegularization).toHaveBeenCalledWith(regularizationData);
      expect(result.current.loading).toBe(false);
    });

    it('should handle regularization error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const regularizationData: RegularizationRequest = {
        employee_id: mockEmployeeId,
        date: mockDate,
        reason: 'System was down',
      };

      const errorMessage = 'Invalid request';
      vi.mocked(attendanceService.requestRegularization).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        try {
          await result.current.requestRegularization(regularizationData);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchTeamAttendance', () => {
    it('should fetch team attendance records', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const mockTeamRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockTeamRecords);

      await act(async () => {
        await result.current.fetchTeamAttendance();
      });

      expect(result.current.teamRecords).toEqual(mockTeamRecords);
      expect(result.current.loading).toBe(false);
    });

    it('should support date filter for team attendance', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const mockTeamRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockTeamRecords);

      await act(async () => {
        await result.current.fetchTeamAttendance(mockDate);
      });

      expect(attendanceService.getTeamAttendance).toHaveBeenCalledWith(mockDate);
    });

    it('should handle fetch error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Failed to fetch team attendance';
      vi.mocked(attendanceService.getTeamAttendance).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.fetchTeamAttendance();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('exportRecords', () => {
    it('should export attendance records', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      vi.mocked(attendanceService.exportRecords).mockResolvedValue(mockBlob);

      const filters: AttendanceFilters = {
        employee_id: mockEmployeeId,
      };

      let exportedBlob: Blob | undefined;

      await act(async () => {
        exportedBlob = await result.current.exportRecords(filters);
      });

      expect(exportedBlob).toEqual(mockBlob);
      expect(result.current.loading).toBe(false);
    });

    it('should handle export error', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Export failed';
      vi.mocked(attendanceService.exportRecords).mockRejectedValue(new Error(errorMessage));

      const filters: AttendanceFilters = {
        employee_id: mockEmployeeId,
      };

      await act(async () => {
        try {
          await result.current.exportRecords(filters);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Test error';
      vi.mocked(attendanceService.getRecords).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.fetchRecords();
      });

      expect(result.current.error).toBe(errorMessage);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValue(mockRecords);

      await act(async () => {
        await result.current.fetchRecords();
      });

      expect(result.current.records).toEqual(mockRecords);

      act(() => {
        result.current.reset();
      });

      expect(result.current.records).toEqual([]);
      expect(result.current.currentStatus).toBeNull();
      expect(result.current.stats).toBeNull();
      expect(result.current.teamRecords).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent fetch operations', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValue(mockRecords);
      vi.mocked(attendanceService.getStats).mockResolvedValue(mockAttendanceStats);

      await act(async () => {
        await Promise.all([
          result.current.fetchRecords(),
          result.current.fetchStats(mockEmployeeId),
        ]);
      });

      expect(result.current.records).toEqual(mockRecords);
      expect(result.current.stats).toEqual(mockAttendanceStats);
    });
  });

  describe('Error State Management', () => {
    it('should clear error on successful operation', async () => {
      const { result } = renderHook(() => useAttendanceStore());

      const errorMessage = 'Previous error';
      vi.mocked(attendanceService.getRecords).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        try {
          await result.current.fetchRecords();
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);

      const mockRecords = [mockAttendanceRecord];
      vi.mocked(attendanceService.getRecords).mockResolvedValueOnce(mockRecords);

      await act(async () => {
        await result.current.fetchRecords();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.records).toEqual(mockRecords);
    });
  });
});
