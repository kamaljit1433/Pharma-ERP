/**
 * Shift Repository - Unit Tests
 * Tests for shift CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Shift Operations', () => {
  let testShiftId: string;

  beforeAll(async () => {
    await db('shifts').del();
  });

  afterAll(async () => {
    await db('shifts').del();
  });

  describe('Create Shift', () => {
    it('should create a shift', async () => {
      const [shift] = await db('shifts')
        .insert({
          name: 'Morning Shift',
          start_time: '09:00:00',
          end_time: '17:00:00',
          shift_type: 'fixed',
          is_active: true,
        })
        .returning('*');

      expect(shift).toBeDefined();
      expect(shift.id).toBeDefined();
      expect(shift.name).toBe('Morning Shift');
      expect(shift.shift_type).toBe('fixed');

      testShiftId = shift.id;
    });

    it('should create rotating shift', async () => {
      const [shift] = await db('shifts')
        .insert({
          name: 'Rotating Shift',
          shift_type: 'rotating',
          rotation_pattern: 'morning,evening,night',
          is_active: true,
        })
        .returning('*');

      expect(shift.shift_type).toBe('rotating');
      expect(shift.rotation_pattern).toBe('morning,evening,night');
    });

    it('should create flexible shift', async () => {
      const [shift] = await db('shifts')
        .insert({
          name: 'Flexible Shift',
          shift_type: 'flexible',
          min_hours: 8,
          max_hours: 10,
          is_active: true,
        })
        .returning('*');

      expect(shift.shift_type).toBe('flexible');
      expect(shift.min_hours).toBe(8);
      expect(shift.max_hours).toBe(10);
    });
  });

  describe('Retrieve Shift', () => {
    it('should retrieve shift by ID', async () => {
      const shift = await db('shifts').where({ id: testShiftId }).first();

      expect(shift).toBeDefined();
      expect(shift.id).toBe(testShiftId);
      expect(shift.name).toBe('Morning Shift');
    });

    it('should retrieve all active shifts', async () => {
      const shifts = await db('shifts').where({ is_active: true });

      expect(Array.isArray(shifts)).toBe(true);
      expect(shifts.every((s) => s.is_active === true)).toBe(true);
    });

    it('should retrieve shift by name', async () => {
      const shift = await db('shifts')
        .where({ name: 'Morning Shift' })
        .first();

      expect(shift).toBeDefined();
      expect(shift.name).toBe('Morning Shift');
    });
  });

  describe('Update Shift', () => {
    it('should update shift details', async () => {
      await db('shifts').where({ id: testShiftId }).update({
        end_time: '18:00:00',
        is_active: false,
      });

      const updated = await db('shifts')
        .where({ id: testShiftId })
        .first();

      expect(updated.end_time).toBe('18:00:00');
      expect(updated.is_active).toBe(false);
    });
  });

  describe('Delete Shift', () => {
    it('should delete a shift', async () => {
      const [shift] = await db('shifts')
        .insert({
          name: 'Temp Shift',
          start_time: '08:00:00',
          end_time: '16:00:00',
          shift_type: 'fixed',
        })
        .returning('*');

      await db('shifts').where({ id: shift.id }).del();

      const deleted = await db('shifts')
        .where({ id: shift.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Shift Assignment', () => {
    it('should assign employee to shift', async () => {
      const empId = 'a0000000-0000-4000-a000-000000000001';
      const [assignment] = await db('employee_shifts')
        .insert({
          employee_id: empId,
          shift_id: testShiftId,
          effective_from: new Date().toISOString().split('T')[0],
        })
        .returning('*');

      expect(assignment).toBeDefined();
      expect(assignment.employee_id).toBe(empId);
      expect(assignment.shift_id).toBe(testShiftId);
    });

    it('should retrieve employee shifts', async () => {
      const empId = 'a0000000-0000-4000-a000-000000000001';
      const shifts = await db('employee_shifts')
        .where({ employee_id: empId });

      expect(Array.isArray(shifts)).toBe(true);
    });
  });

  describe('Query Shifts', () => {
    it('should retrieve shifts by type', async () => {
      const shifts = await db('shifts').where({ shift_type: 'fixed' });

      expect(Array.isArray(shifts)).toBe(true);
      expect(shifts.every((s) => s.shift_type === 'fixed')).toBe(true);
    });

    it('should count total shifts', async () => {
      const result = await db('shifts')
        .count('* as count')
        .first();

      expect(Number(result?.['count'])).toBeGreaterThan(0);
    });
  });
});
