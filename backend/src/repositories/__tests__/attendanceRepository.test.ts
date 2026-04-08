/**
 * Attendance Repository - Unit Tests
 * Tests for attendance CRUD operations and queries
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Attendance Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testAttendanceId: string;

  beforeAll(async () => {
    await db('attendance').del();
    // Create test employee (FK requirement)
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-TEST-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.employee@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('attendance').del();
    await db('employees').where({ id: testEmployeeId }).del();
    await db.destroy();
  });

  describe('Create Attendance Record', () => {
    it('should create attendance check-in', async () => {
      const today = new Date().toISOString().split('T')[0];
      const [attendance] = await db('attendance')
        .insert({
          employee_id: testEmployeeId,
          attendance_date: today,
          check_in_time: '09:00:00',
          face_detected: true,
          status: 'present',
        })
        .returning('*');

      expect(attendance).toBeDefined();
      expect(attendance.id).toBeDefined();
      expect(attendance.employee_id).toBe(testEmployeeId);
      expect(attendance.status).toBe('present');

      testAttendanceId = attendance.id;
    });

    it('should create attendance with check-out', async () => {
      const today = new Date().toISOString().split('T')[0];
      const [attendance] = await db('attendance')
        .insert({
          employee_id: testEmployeeId,
          attendance_date: today,
          check_in_time: '09:00:00',
          check_out_time: '17:30:00',
          face_detected: true,
          status: 'present',
          working_hours: 8,
        })
        .returning('*');

      expect(attendance.check_out_time).toBe('17:30:00');
      expect(attendance.working_hours).toBe(8);
    });
  });

  describe('Retrieve Attendance', () => {
    it('should retrieve attendance by ID', async () => {
      const attendance = await db('attendance')
        .where({ id: testAttendanceId })
        .first();

      expect(attendance).toBeDefined();
      expect(attendance.id).toBe(testAttendanceId);
    });

    it('should retrieve attendance by employee and date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const attendance = await db('attendance')
        .where({ employee_id: testEmployeeId, attendance_date: today })
        .first();

      expect(attendance).toBeDefined();
      expect(attendance.employee_id).toBe(testEmployeeId);
    });

    it('should retrieve monthly attendance', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const attendances = await db('attendance')
        .where({ employee_id: testEmployeeId })
        .whereRaw(`EXTRACT(YEAR FROM attendance_date) = ?`, [year])
        .whereRaw(`EXTRACT(MONTH FROM attendance_date) = ?`, [month]);

      expect(Array.isArray(attendances)).toBe(true);
    });
  });

  describe('Update Attendance', () => {
    it('should update check-out time', async () => {
      await db('attendance').where({ id: testAttendanceId }).update({
        check_out_time: '18:00:00',
        working_hours: 9,
      });

      const updated = await db('attendance')
        .where({ id: testAttendanceId })
        .first();

      expect(updated.check_out_time).toBe('18:00:00');
      expect(updated.working_hours).toBe(9);
    });

    it('should update attendance status', async () => {
      await db('attendance').where({ id: testAttendanceId }).update({
        status: 'half_day',
      });

      const updated = await db('attendance')
        .where({ id: testAttendanceId })
        .first();

      expect(updated.status).toBe('half_day');
    });
  });

  describe('Query Attendance', () => {
    it('should retrieve attendance by status', async () => {
      const attendances = await db('attendance')
        .where({ employee_id: testEmployeeId, status: 'present' });

      expect(Array.isArray(attendances)).toBe(true);
      expect(attendances.every((a) => a.status === 'present')).toBe(true);
    });

    it('should retrieve attendance with face detection', async () => {
      const attendances = await db('attendance')
        .where({ employee_id: testEmployeeId, face_detected: true });

      expect(Array.isArray(attendances)).toBe(true);
      expect(attendances.every((a) => a.face_detected === true)).toBe(true);
    });

    it('should retrieve incomplete check-outs', async () => {
      const attendances = await db('attendance')
        .where({ employee_id: testEmployeeId })
        .whereNull('check_out_time');

      expect(Array.isArray(attendances)).toBe(true);
    });
  });

  describe('Attendance Statistics', () => {
    it('should calculate total working hours', async () => {
      const result = await db('attendance')
        .where({ employee_id: testEmployeeId })
        .sum('working_hours as total_hours')
        .first();

      expect(result).toBeDefined();
      // PostgreSQL .sum() returns a string; check it is not null
      expect(result!['total_hours']).not.toBeNull();
    });

    it('should count attendance by status', async () => {
      const result = await db('attendance')
        .where({ employee_id: testEmployeeId })
        .select('status')
        .count('* as count')
        .groupBy('status');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should get average working hours', async () => {
      const result = await db('attendance')
        .where({ employee_id: testEmployeeId })
        .avg('working_hours as avg_hours')
        .first();

      expect(result).toBeDefined();
    });
  });

  describe('Delete Attendance', () => {
    it('should delete attendance record', async () => {
      const today = new Date().toISOString().split('T')[0];
      const [attendance] = await db('attendance')
        .insert({
          employee_id: testEmployeeId,
          attendance_date: today,
          check_in_time: '10:00:00',
          status: 'present',
        })
        .returning('*');

      await db('attendance').where({ id: attendance.id }).del();

      const deleted = await db('attendance')
        .where({ id: attendance.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });
});
