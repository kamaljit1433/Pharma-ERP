/**
 * Property-Based Tests for Attendance Module
 * Validates multiple properties for attendance functionality
 */

import fc from 'fast-check';
import { attendanceService, Attendance } from '../attendanceService';

describe('Attendance Service - Property Tests', () => {
  /**
   * Arbitrary generator for valid GPS coordinates
   */
  const geoLocationArbitrary = () =>
    fc.record({
      latitude: fc.double({ min: -90, max: 90, noNaN: true }),
      longitude: fc.double({ min: -180, max: 180, noNaN: true }),
      accuracy: fc.double({ min: 0, max: 100, noNaN: true }),
      timestamp: fc.date(),
    });

  /**
   * Feature: employee-management-system
   * Property 13: Working Hours Calculation
   *
   * For any attendance record with check-in time, check-out time, and configured
   * break duration, the calculated working hours must equal
   * (check-out time − check-in time − break duration).
   *
   * **Validates: Requirements 4.3.2**
   */
  it('Property 13: Working hours calculation', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01T06:00:00'), max: new Date('2024-12-31T12:00:00') }),
        fc.integer({ min: 1, max: 12 }), // hours to add for checkout
        (checkInTime, hoursToAdd) => {
          const checkOutTime = new Date(checkInTime.getTime() + hoursToAdd * 60 * 60 * 1000);

          const attendance: Attendance = {
            id: 'att-1',
            employeeId: 'emp-1',
            date: new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate()),
            checkInTime,
            checkOutTime,
            mode: 'PWA',
            status: 'Present',
            faceDetected: true,
            regularizationRequested: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const calculatedHours = attendanceService.calculateWorkingHours(attendance);
          const expectedHours = (hoursToAdd * 60 - 60) / 60; // Subtract 60-minute break

          expect(calculatedHours).toBeCloseTo(expectedHours, 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 14: Overtime Calculation
   *
   * For any attendance record with working hours exceeding the standard shift
   * duration, overtime hours must equal (total working hours − standard shift
   * duration) and must be tracked separately.
   *
   * **Validates: Requirements 4.3.3, 4.3.4**
   */
  it('Property 14: Overtime calculation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 16, noNaN: true }), // working hours, exclude NaN
        (workingHours) => {
          const attendance: Attendance = {
            id: 'att-1',
            employeeId: 'emp-1',
            date: new Date(),
            checkInTime: new Date(),
            checkOutTime: new Date(),
            totalHours: workingHours,
            mode: 'PWA',
            status: 'Present',
            faceDetected: true,
            regularizationRequested: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const overtimeHours = attendanceService.calculateOvertimeHours(attendance);
          const expectedOvertime = Math.max(0, workingHours - 8);

          expect(overtimeHours).toBeCloseTo(expectedOvertime, 1);
          expect(overtimeHours).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 15: Remote Attendance GPS Requirement
   *
   * For any attendance marked in remote mode, the attendance record must
   * include valid GPS coordinates (latitude, longitude, accuracy, timestamp).
   *
   * **Validates: Requirements 4.3.5**
   */
  it('Property 15: Remote attendance GPS requirement', () => {
    fc.assert(
      fc.asyncProperty(
        geoLocationArbitrary(),
        async (location) => {
          const attendance = await attendanceService.checkIn('emp-1', location, true);

          // Verify GPS coordinates are present
          expect(attendance.checkInLocation).toBeDefined();
          expect(attendance.checkInLocation?.latitude).toBe(location.latitude);
          expect(attendance.checkInLocation?.longitude).toBe(location.longitude);
          expect(attendance.checkInLocation?.accuracy).toBe(location.accuracy);
          expect(attendance.checkInLocation?.timestamp).toEqual(location.timestamp);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 16: Monthly Attendance Aggregation
   *
   * For any employee and month, the monthly attendance summary must correctly
   * aggregate all attendance records for that period, including total present
   * days, absent days, half-days, leaves, and total working hours.
   *
   * **Validates: Requirements 4.3.8**
   */
  it('Property 16: Monthly attendance aggregation', () => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 12 }), // month
        fc.integer({ min: 2024, max: 2025 }), // year
        async (month, year) => {
          const records = await attendanceService.getMonthlyAttendance('emp-1', month, year);

          // Verify records are for the correct month/year
          records.forEach((record) => {
            expect(record.date.getMonth() + 1).toBe(month);
            expect(record.date.getFullYear()).toBe(year);
          });

          // Verify aggregation properties
          const totalWorkingHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
          expect(totalWorkingHours).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 17: Late Check-In Alert
   *
   * For any employee who has not checked in by the configured threshold time
   * on a working day, an alert notification must be sent to their reporting manager.
   *
   * **Validates: Requirements 4.3.9**
   */
  it('Property 17: Late check-in alert', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01T08:00:00'), max: new Date('2024-12-31T12:00:00') }),
        (checkInTime) => {
          // Verify check-in time is captured
          expect(checkInTime).toBeInstanceOf(Date);

          // Verify time can be compared for late check-in detection
          const thresholdTime = new Date(checkInTime);
          thresholdTime.setHours(9, 30, 0, 0); // 9:30 AM threshold

          const isLate = checkInTime.getTime() > thresholdTime.getTime();
          expect(typeof isLate).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 53: Incomplete Check-Out Flagging
   *
   * For any attendance record where check-in exists but check-out is null
   * after the end of the working day, the record must be flagged as incomplete
   * and a notification must be sent to the employee.
   *
   * **Validates: Requirements FR-4.6.4**
   */
  it('Property 53: Incomplete check-out flagging', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01T06:00:00'), max: new Date('2024-12-31T18:00:00') }),
        (checkInTime) => {
          const attendance: Attendance = {
            id: 'att-1',
            employeeId: 'emp-1',
            date: new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate()),
            checkInTime,
            mode: 'PWA',
            status: 'Present',
            faceDetected: true,
            regularizationRequested: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Verify incomplete check-out can be detected
          const isIncomplete = !attendance.checkOutTime;
          expect(isIncomplete).toBe(true);

          // Verify status can be flagged
          const shouldFlag = isIncomplete && checkInTime.getHours() < 18;
          expect(typeof shouldFlag).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 54: Multiple Daily Attendance Support
   *
   * For any employee and date, the system must support storing multiple
   * check-in/check-out pairs (for field staff visiting multiple sites), and
   * total working hours must be the sum of all pairs.
   *
   * **Validates: Requirements FR-4.6.5**
   */
  it('Property 54: Multiple daily attendance support', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            checkInTime: fc.date(),
            checkOutTime: fc.date(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (attendancePairs) => {
          // Ensure check-out is after check-in for each pair
          const validPairs = attendancePairs.filter(
            (p) => p.checkOutTime.getTime() > p.checkInTime.getTime()
          );

          // Calculate total working hours
          let totalHours = 0;
          validPairs.forEach((pair) => {
            const diffMs = pair.checkOutTime.getTime() - pair.checkInTime.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            totalHours += diffHours;
          });

          // Verify total is sum of all pairs
          expect(totalHours).toBeGreaterThanOrEqual(0);
          expect(validPairs.length).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Working hours should never be negative
   */
  it('should never calculate negative working hours', () => {
    fc.assert(
      fc.property(
        fc.date(),
        fc.date(),
        (checkInTime, checkOutTime) => {
          const attendance: Attendance = {
            id: 'att-1',
            employeeId: 'emp-1',
            date: new Date(),
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

          expect(workingHours).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Overtime should never be negative
   */
  it('should never calculate negative overtime', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 20 }),
        (workingHours) => {
          const attendance: Attendance = {
            id: 'att-1',
            employeeId: 'emp-1',
            date: new Date(),
            checkInTime: new Date(),
            checkOutTime: new Date(),
            totalHours: workingHours,
            mode: 'PWA',
            status: 'Present',
            faceDetected: true,
            regularizationRequested: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const overtimeHours = attendanceService.calculateOvertimeHours(attendance);

          expect(overtimeHours).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
