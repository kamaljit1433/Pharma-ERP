/**
 * Unit Tests for Attendance Service
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock knex before importing service
const mockFnNow = jest.fn(() => new Date());

const buildChain = (resolveValue: any = null) => {
  const chain: any = {};
  const ops = ['where', 'whereIn', 'whereBetween', 'select', 'orderBy', 'first', 'insert', 'update', 'returning', 'del'];
  ops.forEach((op) => {
    chain[op] = jest.fn().mockImplementation((..._args: any[]) => {
      if (op === 'first') return Promise.resolve(resolveValue);
      if (op === 'returning') return Promise.resolve(resolveValue ? [resolveValue] : []);
      if (op === 'update' || op === 'del') return Promise.resolve(1);
      return chain;
    });
  });
  return chain;
};

const mockAttendance = {
  id: 'att-uuid-1',
  employee_id: 'emp-123',
  attendance_date: '2024-01-15',
  check_in_time: '09:00:00',
  check_out_time: null,
  working_hours: null,
  overtime_minutes: null,
  status: 'present',
  check_in_latitude: 40.7128,
  check_in_longitude: -74.006,
  check_out_latitude: null,
  check_out_longitude: null,
  face_detected: true,
  shift_id: null,
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockAttendanceWithCheckout = {
  ...mockAttendance,
  check_in_time: '09:00:00',
  check_out_time: '17:00:00',
  working_hours: 7,
  overtime_minutes: 0,
  check_out_latitude: 40.7128,
  check_out_longitude: -74.006,
};

const mockRegRequest = {
  id: 'req-uuid-1',
  attendance_id: 'att-uuid-1',
  employee_id: 'emp-123',
  reason: 'System error during check-out',
  status: 'pending',
  approved_by: null,
  approval_notes: null,
  approved_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockApprovedRequest = {
  ...mockRegRequest,
  status: 'approved',
  approved_by: 'mgr-123',
  approval_notes: 'Approved',
  approved_at: new Date(),
};

let mockDbCalls: Record<string, any> = {};

const mockKnex: any = jest.fn((table: string) => {
  return mockDbCalls[table] ?? buildChain();
});
mockKnex.fn = { now: mockFnNow };

jest.mock('../../config/knex', () => ({
  getKnexInstance: () => mockKnex,
  default: mockKnex,
}));

import { attendanceService } from '../attendanceService';

const mockLocation = {
  latitude: 40.7128,
  longitude: -74.006,
  accuracy: 10,
  timestamp: new Date(),
};

describe('AttendanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbCalls = {};
  });

  describe('checkIn', () => {
    it('should reject check-in without face detection', async () => {
      await expect(
        attendanceService.checkIn('emp-123', mockLocation, false)
      ).rejects.toThrow('Face detection required for check-in');
    });

    it('should reject check-in with invalid GPS location', async () => {
      await expect(
        attendanceService.checkIn('emp-123', { latitude: 200, longitude: -74.006 }, true)
      ).rejects.toThrow('Valid GPS location required for check-in');
    });

    it('should reject check-in with missing GPS location', async () => {
      await expect(
        attendanceService.checkIn('emp-123', null as any, true)
      ).rejects.toThrow('Valid GPS location required for check-in');
    });

    it('should create attendance record on successful check-in', async () => {
      const empChain = buildChain({ id: 'emp-123' });
      const attChain = buildChain(null); // no existing record today
      const insertChain = buildChain(mockAttendance);
      const logChain = buildChain();

      let callCount = 0;
      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') return empChain;
        if (table === 'attendance') {
          callCount++;
          if (callCount === 1) return attChain;     // where({ employee_id, date }).first()
          if (callCount === 2) return insertChain;  // insert().returning()
          return buildChain(mockAttendance);         // where({ id }).first() after insert
        }
        if (table === 'face_detection_logs') return logChain;
        return buildChain();
      });

      const attendance = await attendanceService.checkIn('emp-123', mockLocation, true);
      expect(attendance).toBeDefined();
      expect(attendance.employeeId).toBe('emp-123');
      expect(attendance.faceDetected).toBe(true);
      expect(attendance.status).toBe('present');
      expect(attendance.checkInLatitude).toBe(40.7128);
    });

    it('should throw when employee not found', async () => {
      mockKnex.mockImplementation((table: string) => {
        if (table === 'employees') return buildChain(null);
        return buildChain();
      });

      await expect(
        attendanceService.checkIn('nonexistent', mockLocation, true)
      ).rejects.toThrow('Employee not found: nonexistent');
    });
  });

  describe('checkOut', () => {
    it('should reject check-out with invalid GPS location', async () => {
      await expect(
        attendanceService.checkOut('att-123', { latitude: 200, longitude: -74.006 })
      ).rejects.toThrow('Valid GPS location required for check-out');
    });

    it('should throw when attendance record not found', async () => {
      mockKnex.mockImplementation(() => buildChain(null));
      await expect(
        attendanceService.checkOut('att-missing', mockLocation)
      ).rejects.toThrow('Attendance record not found: att-missing');
    });

    it('should create check-out record with working hours', async () => {
      let callCount = 0;
      mockKnex.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return buildChain(mockAttendance);       // first() → existing record
        if (callCount === 2) return buildChain(1);                     // update()
        return buildChain(mockAttendanceWithCheckout);                  // first() after update
      });

      const attendance = await attendanceService.checkOut('att-uuid-1', mockLocation);
      expect(attendance).toBeDefined();
      expect(attendance.checkOutTime).toBeDefined();
      expect(attendance.checkOutLatitude).toBe(40.7128);
      expect(attendance.workingHours).toBeGreaterThanOrEqual(0);
    });

    it('should throw when no check-in exists', async () => {
      mockKnex.mockImplementation(() =>
        buildChain({ ...mockAttendance, check_in_time: null })
      );
      await expect(
        attendanceService.checkOut('att-uuid-1', mockLocation)
      ).rejects.toThrow('Cannot check out without a check-in record');
    });
  });

  describe('calculateWorkingHours', () => {
    it('should calculate working hours correctly with Date objects', () => {
      const checkIn = new Date('2024-01-15T09:00:00');
      const checkOut = new Date('2024-01-15T18:00:00');
      const hours = attendanceService.calculateWorkingHours(checkIn, checkOut);
      expect(hours).toBe(8); // 9h gross - 1h break
    });

    it('should return 0 for missing check-out time', () => {
      const checkIn = new Date('2024-01-15T09:00:00');
      const hours = attendanceService.calculateWorkingHours(checkIn, undefined);
      expect(hours).toBe(0);
    });

    it('should handle partial hours', () => {
      const checkIn = new Date('2024-01-15T09:00:00');
      const checkOut = new Date('2024-01-15T12:30:00');
      const hours = attendanceService.calculateWorkingHours(checkIn, checkOut);
      expect(hours).toBeCloseTo(2.5, 1); // 3.5h gross - 1h break
    });

    it('should calculate working hours from time strings', () => {
      const hours = attendanceService.calculateWorkingHours('09:00:00', '18:00:00');
      expect(hours).toBe(8);
    });
  });

  describe('calculateOvertimeHours', () => {
    it('should calculate overtime hours correctly', () => {
      const overtime = attendanceService.calculateOvertimeHours(10);
      expect(overtime).toBe(2); // 10h - 8h standard
    });

    it('should return 0 for no overtime', () => {
      const overtime = attendanceService.calculateOvertimeHours(8);
      expect(overtime).toBe(0);
    });

    it('should return 0 when below standard hours', () => {
      const overtime = attendanceService.calculateOvertimeHours(6);
      expect(overtime).toBe(0);
    });
  });

  describe('requestRegularization', () => {
    it('should create regularization request', async () => {
      let callCount = 0;
      mockKnex.mockImplementation((table: string) => {
        if (table === 'attendance') {
          callCount++;
          return buildChain(callCount === 1 ? mockAttendance : null);
        }
        if (table === 'attendance_regularization_requests') return buildChain(mockRegRequest);
        return buildChain();
      });

      const request = await attendanceService.requestRegularization(
        'att-uuid-1', 'emp-123', 'System error during check-out'
      );

      expect(request).toBeDefined();
      expect(request.attendanceId).toBe('att-uuid-1');
      expect(request.employeeId).toBe('emp-123');
      expect(request.reason).toBe('System error during check-out');
      expect(request.status).toBe('pending');
    });

    it('should throw when attendance not found', async () => {
      mockKnex.mockImplementation(() => buildChain(null));
      await expect(
        attendanceService.requestRegularization('bad-id', 'emp-123', 'test')
      ).rejects.toThrow('Attendance record not found');
    });
  });

  describe('approveRegularization', () => {
    it('should approve regularization request', async () => {
      let callCount = 0;
      mockKnex.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return buildChain(mockRegRequest);       // first() pending
        if (callCount === 2) return buildChain(1);                     // update()
        return buildChain(mockApprovedRequest);                         // first() after update
      });

      const request = await attendanceService.approveRegularization('req-uuid-1', 'mgr-123', 'Approved');
      expect(request.status).toBe('approved');
      expect(request.approvedBy).toBe('mgr-123');
      expect(request.approvalNotes).toBe('Approved');
      expect(request.approvedAt).toBeDefined();
    });

    it('should throw when request not found', async () => {
      mockKnex.mockImplementation(() => buildChain(null));
      await expect(
        attendanceService.approveRegularization('bad-id', 'mgr-123')
      ).rejects.toThrow('Regularization request not found');
    });

    it('should throw when request is not pending', async () => {
      mockKnex.mockImplementation(() => buildChain(mockApprovedRequest));
      await expect(
        attendanceService.approveRegularization('req-uuid-1', 'mgr-123')
      ).rejects.toThrow('Request is already approved');
    });
  });

  describe('getMonthlyAttendance', () => {
    it('should return monthly attendance records', async () => {
      const chain = buildChain([mockAttendance]);
      chain.orderBy = jest.fn().mockResolvedValue([mockAttendance]);
      mockKnex.mockImplementation(() => chain);

      const records = await attendanceService.getMonthlyAttendance('emp-123', 1, 2024);
      expect(Array.isArray(records)).toBe(true);
    });
  });
});
