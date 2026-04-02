/**
 * Unit tests for attendance service API calls
 * Tests mark attendance, fetch records, and stats retrieval
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import attendanceService, { MarkAttendanceDTO, AttendanceRecord } from '../../../services/attendanceService';

// Mock the API client
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from '../../../services/api';

describe('Attendance Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markAttendance', () => {
    it('should mark attendance with web mode', async () => {
      const mockRecord: AttendanceRecord = {
        id: '1',
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:00:00Z',
        status: 'present',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockRecord });

      const data: MarkAttendanceDTO = {
        employee_id: 'emp-1',
        type: 'check_in',
        mode: 'web',
      };

      const result = await attendanceService.markAttendance(data);

      expect(apiClient.post).toHaveBeenCalledWith('/attendance/mark', data);
      expect(result).toEqual(mockRecord);
    });

    it('should mark attendance with GPS location', async () => {
      const mockRecord: AttendanceRecord = {
        id: '1',
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:00:00Z',
        check_in_location: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
        status: 'present',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockRecord });

      const data: MarkAttendanceDTO = {
        employee_id: 'emp-1',
        type: 'check_in',
        mode: 'gps',
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      const result = await attendanceService.markAttendance(data);

      expect(apiClient.post).toHaveBeenCalledWith('/attendance/mark', data);
      expect(result.check_in_location).toEqual(data.location);
    });

    it('should handle check-out', async () => {
      const mockRecord: AttendanceRecord = {
        id: '1',
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:00:00Z',
        check_out_time: '2024-01-15T17:30:00Z',
        working_hours: 8.5,
        status: 'present',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockRecord });

      const data: MarkAttendanceDTO = {
        employee_id: 'emp-1',
        type: 'check_out',
        mode: 'web',
      };

      const result = await attendanceService.markAttendance(data);

      expect(apiClient.post).toHaveBeenCalledWith('/attendance/mark', data);
      expect(result.check_out_time).toBeDefined();
      expect(result.working_hours).toBe(8.5);
    });
  });

  describe('getRecords', () => {
    it('should fetch attendance records', async () => {
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          employee_id: 'emp-1',
          date: '2024-01-15',
          check_in_time: '2024-01-15T09:00:00Z',
          status: 'present',
        },
        {
          id: '2',
          employee_id: 'emp-1',
          date: '2024-01-16',
          status: 'absent',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRecords });

      const result = await attendanceService.getRecords({
        employee_id: 'emp-1',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: { employee_id: 'emp-1' },
        signal: undefined,
      });
      expect(result).toEqual(mockRecords);
      expect(result).toHaveLength(2);
    });

    it('should fetch records with date range filter', async () => {
      const mockRecords: AttendanceRecord[] = [];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRecords });

      await attendanceService.getRecords({
        employee_id: 'emp-1',
        from_date: '2024-01-01',
        to_date: '2024-01-31',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/attendance', {
        params: {
          employee_id: 'emp-1',
          from_date: '2024-01-01',
          to_date: '2024-01-31',
        },
        signal: undefined,
      });
    });
  });

  describe('getCurrentStatus', () => {
    it('should fetch current attendance status', async () => {
      const mockStatus: AttendanceRecord = {
        id: '1',
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:00:00Z',
        status: 'present',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      const result = await attendanceService.getCurrentStatus('emp-1');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/current/emp-1');
      expect(result).toEqual(mockStatus);
    });

    it('should return null if no current status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: null });

      const result = await attendanceService.getCurrentStatus('emp-1');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should fetch attendance statistics', async () => {
      const mockStats = {
        total_days: 20,
        present_days: 18,
        absent_days: 2,
        half_days: 0,
        on_leave_days: 0,
        late_arrivals: 3,
        average_working_hours: 8.5,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      const result = await attendanceService.getStats('emp-1');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/stats/emp-1', {
        params: { from_date: undefined, to_date: undefined },
      });
      expect(result.present_days).toBe(18);
      expect(result.absent_days).toBe(2);
    });

    it('should fetch stats with date range', async () => {
      const mockStats = {
        total_days: 10,
        present_days: 9,
        absent_days: 1,
        half_days: 0,
        on_leave_days: 0,
        late_arrivals: 1,
        average_working_hours: 8.5,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      await attendanceService.getStats('emp-1', '2024-01-01', '2024-01-10');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/stats/emp-1', {
        params: { from_date: '2024-01-01', to_date: '2024-01-10' },
      });
    });
  });

  describe('requestRegularization', () => {
    it('should submit regularization request', async () => {
      const mockResponse = {
        id: 'reg-1',
        message: 'Regularization request submitted',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await attendanceService.requestRegularization({
        employee_id: 'emp-1',
        date: '2024-01-15',
        reason: 'System was down',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/attendance/regularization', {
        employee_id: 'emp-1',
        date: '2024-01-15',
        reason: 'System was down',
      });
      expect(result.id).toBe('reg-1');
    });

    it('should include optional check-in/check-out times', async () => {
      const mockResponse = {
        id: 'reg-1',
        message: 'Regularization request submitted',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      await attendanceService.requestRegularization({
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '09:00',
        check_out_time: '17:30',
        reason: 'Manual entry needed',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/attendance/regularization', {
        employee_id: 'emp-1',
        date: '2024-01-15',
        check_in_time: '09:00',
        check_out_time: '17:30',
        reason: 'Manual entry needed',
      });
    });
  });

  describe('getTeamAttendance', () => {
    it('should fetch team attendance records', async () => {
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          employee_id: 'emp-1',
          date: '2024-01-15',
          check_in_time: '2024-01-15T09:00:00Z',
          status: 'present',
        },
        {
          id: '2',
          employee_id: 'emp-2',
          date: '2024-01-15',
          status: 'absent',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRecords });

      const result = await attendanceService.getTeamAttendance('2024-01-15');

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/team', {
        params: { date: '2024-01-15' },
        signal: undefined,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('exportRecords', () => {
    it('should export records as blob', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBlob });

      const result = await attendanceService.exportRecords({
        employee_id: 'emp-1',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/attendance/export', {
        params: { employee_id: 'emp-1' },
        responseType: 'blob',
      });
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
