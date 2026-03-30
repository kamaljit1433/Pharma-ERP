/**
 * Unit Tests for Attendance Service
 */

import { attendanceService, Attendance } from '../attendanceService';
import { GeoLocation } from '../geoTrackingService';

describe('AttendanceService', () => {
  const mockLocation: GeoLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    timestamp: new Date(),
  };

  const employeeId = 'emp-123';

  describe('checkIn', () => {
    it('should create attendance record on successful check-in', async () => {
      const attendance = await attendanceService.checkIn(
        employeeId,
        mockLocation,
        true
      );

      expect(attendance).toBeDefined();
      expect(attendance.employeeId).toBe(employeeId);
      expect(attendance.faceDetected).toBe(true);
      expect(attendance.status).toBe('Present');
      expect(attendance.checkInLocation).toEqual(mockLocation);
    });

    it('should reject check-in without face detection', async () => {
      await expect(
        attendanceService.checkIn(employeeId, mockLocation, false)
      ).rejects.toThrow('Face detection required for check-in');
    });

    it('should reject check-in with invalid GPS location', async () => {
      const invalidLocation: GeoLocation = {
        latitude: 200, // Invalid latitude
        longitude: -74.006,
        accuracy: 10,
        timestamp: new Date(),
      };

      await expect(
        attendanceService.checkIn(employeeId, invalidLocation, true)
      ).rejects.toThrow('Valid GPS location required for check-in');
    });

    it('should reject check-in with missing GPS location', async () => {
      await expect(
        attendanceService.checkIn(employeeId, null as any, true)
      ).rejects.toThrow('Valid GPS location required for check-in');
    });

    it('should set check-in time to current time', async () => {
      const beforeCheckIn = new Date();
      const attendance = await attendanceService.checkIn(
        employeeId,
        mockLocation,
        true
      );
      const afterCheckIn = new Date();

      expect(attendance.checkInTime.getTime()).toBeGreaterThanOrEqual(
        beforeCheckIn.getTime()
      );
      expect(attendance.checkInTime.getTime()).toBeLessThanOrEqual(
        afterCheckIn.getTime()
      );
    });
  });

  describe('checkOut', () => {
    it('should create check-out record', async () => {
      const attendanceId = 'att-123';
      const attendance = await attendanceService.checkOut(
        attendanceId,
        mockLocation
      );

      expect(attendance).toBeDefined();
      expect(attendance.checkOutTime).toBeDefined();
      expect(attendance.checkOutLocation).toEqual(mockLocation);
    });

    it('should calculate working hours on check-out', async () => {
      const attendanceId = 'att-123';
      const attendance = await attendanceService.checkOut(
        attendanceId,
        mockLocation
      );

      expect(attendance.totalHours).toBeDefined();
      expect(attendance.totalHours).toBeGreaterThan(0);
    });

    it('should reject check-out with invalid GPS location', async () => {
      const invalidLocation: GeoLocation = {
        latitude: 200,
        longitude: -74.006,
        accuracy: 10,
        timestamp: new Date(),
      };

      await expect(
        attendanceService.checkOut('att-123', invalidLocation)
      ).rejects.toThrow('Valid GPS location required for check-out');
    });
  });

  describe('calculateWorkingHours', () => {
    it('should calculate working hours correctly', () => {
      const checkInTime = new Date('2024-01-15T09:00:00');
      const checkOutTime = new Date('2024-01-15T18:00:00');

      const attendance: Attendance = {
        id: 'att-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkInTime,
        checkOutTime,
        mode: 'PWA',
        status: 'Present',
        faceDetected: true,
        regularizationRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const workingHours = attendanceService.calculateWorkingHours(attendance);

      // 9 hours - 1 hour break = 8 hours
      expect(workingHours).toBe(8);
    });

    it('should return 0 for missing check-out time', () => {
      const attendance: Attendance = {
        id: 'att-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkInTime: new Date('2024-01-15T09:00:00'),
        mode: 'PWA',
        status: 'Present',
        faceDetected: true,
        regularizationRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const workingHours = attendanceService.calculateWorkingHours(attendance);

      expect(workingHours).toBe(0);
    });

    it('should handle partial hours', () => {
      const checkInTime = new Date('2024-01-15T09:00:00');
      const checkOutTime = new Date('2024-01-15T12:30:00');

      const attendance: Attendance = {
        id: 'att-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkInTime,
        checkOutTime,
        mode: 'PWA',
        status: 'Present',
        faceDetected: true,
        regularizationRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const workingHours = attendanceService.calculateWorkingHours(attendance);

      // 3.5 hours - 1 hour break = 2.5 hours
      expect(workingHours).toBeCloseTo(2.5, 1);
    });
  });

  describe('calculateOvertimeHours', () => {
    it('should calculate overtime hours correctly', () => {
      const checkInTime = new Date('2024-01-15T09:00:00');
      const checkOutTime = new Date('2024-01-15T20:00:00');

      const attendance: Attendance = {
        id: 'att-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkInTime,
        checkOutTime,
        totalHours: 10, // 11 hours - 1 hour break
        mode: 'PWA',
        status: 'Present',
        faceDetected: true,
        regularizationRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const overtimeHours = attendanceService.calculateOvertimeHours(attendance);

      // 10 hours - 8 hours standard = 2 hours overtime
      expect(overtimeHours).toBe(2);
    });

    it('should return 0 for no overtime', () => {
      const attendance: Attendance = {
        id: 'att-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkInTime: new Date('2024-01-15T09:00:00'),
        checkOutTime: new Date('2024-01-15T18:00:00'),
        totalHours: 8,
        mode: 'PWA',
        status: 'Present',
        faceDetected: true,
        regularizationRequested: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const overtimeHours = attendanceService.calculateOvertimeHours(attendance);

      expect(overtimeHours).toBe(0);
    });
  });

  describe('requestRegularization', () => {
    it('should create regularization request', async () => {
      const attendanceId = 'att-123';
      const reason = 'System error during check-out';

      const request = await attendanceService.requestRegularization(
        attendanceId,
        employeeId,
        reason
      );

      expect(request).toBeDefined();
      expect(request.attendanceId).toBe(attendanceId);
      expect(request.employeeId).toBe(employeeId);
      expect(request.reason).toBe(reason);
      expect(request.status).toBe('Pending');
    });
  });

  describe('approveRegularization', () => {
    it('should approve regularization request', async () => {
      const requestId = 'req-123';
      const approverId = 'mgr-123';
      const comments = 'Approved';

      const request = await attendanceService.approveRegularization(
        requestId,
        approverId,
        comments
      );

      expect(request.status).toBe('Approved');
      expect(request.approverId).toBe(approverId);
      expect(request.approverComments).toBe(comments);
      expect(request.processedAt).toBeDefined();
    });
  });

  describe('getMonthlyAttendance', () => {
    it('should return monthly attendance records', async () => {
      const records = await attendanceService.getMonthlyAttendance(
        employeeId,
        1,
        2024
      );

      expect(Array.isArray(records)).toBe(true);
    });
  });
});
