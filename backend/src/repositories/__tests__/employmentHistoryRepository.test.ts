/**
 * Employment History Repository - Unit Tests
 * Tests for employment history CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Employment History Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testHistoryId: string;

  beforeAll(async () => {
    await db('employment_history').del();
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
    await db('employees').del();
    await db('employment_history').del();
  });

  describe('Create Employment History', () => {
    it('should create employment history record', async () => {
      const [history] = await db('employment_history')
        .insert({
          employee_id: testEmployeeId,
          designation_id: 'd0000000-0000-4000-f000-000000000011',
          department_id: 'd0000000-0000-4000-f000-000000000001',
          from_date: '2024-01-01',
          to_date: '2024-06-01',
          reason: 'Promotion',
        })
        .returning('*');

      expect(history).toBeDefined();
      expect(history.id).toBeDefined();
      expect(history.employee_id).toBe(testEmployeeId);
      expect(history.reason).toBe('Promotion');

      testHistoryId = history.id;
    });

    it('should allow null to_date for current position', async () => {
      const [history] = await db('employment_history')
        .insert({
          employee_id: testEmployeeId,
          designation_id: 'd0000000-0000-4000-f000-000000000012',
          department_id: 'd0000000-0000-4000-f000-000000000002',
          from_date: '2024-06-01',
          to_date: null,
          reason: 'Current Position',
        })
        .returning('*');

      expect(history.to_date).toBeNull();
    });
  });

  describe('Retrieve Employment History', () => {
    it('should retrieve history by ID', async () => {
      const history = await db('employment_history')
        .where({ id: testHistoryId })
        .first();

      expect(history).toBeDefined();
      expect(history.id).toBe(testHistoryId);
      expect(history.reason).toBe('Promotion');
    });

    it('should retrieve all history for an employee', async () => {
      const histories = await db('employment_history')
        .where({ employee_id: testEmployeeId })
        .orderBy('from_date', 'asc');

      expect(Array.isArray(histories)).toBe(true);
      expect(histories.length).toBeGreaterThan(0);
      expect(histories.every((h) => h.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no history', async () => {
      const histories = await db('employment_history')
        .where({ employee_id: 'emp-no-history' });

      expect(Array.isArray(histories)).toBe(true);
      expect(histories.length).toBe(0);
    });
  });

  describe('Update Employment History', () => {
    it('should update history record', async () => {
      await db('employment_history').where({ id: testHistoryId }).update({
        to_date: '2024-07-01',
        reason: 'Lateral Move',
      });

      const updated = await db('employment_history')
        .where({ id: testHistoryId })
        .first();

      expect(updated.to_date).toBe('2024-07-01');
      expect(updated.reason).toBe('Lateral Move');
    });
  });

  describe('Delete Employment History', () => {
    it('should delete history record', async () => {
      const [history] = await db('employment_history')
        .insert({
          employee_id: testEmployeeId,
          designation_id: 'd0000000-0000-4000-f000-000000000013',
          department_id: 'd0000000-0000-4000-f000-000000000003',
          from_date: '2024-08-01',
          reason: 'Test Delete',
        })
        .returning('*');

      await db('employment_history').where({ id: history.id }).del();

      const deleted = await db('employment_history')
        .where({ id: history.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Employment History', () => {
    it('should retrieve history by designation', async () => {
      const histories = await db('employment_history')
        .where({ designation_id: 'd0000000-0000-4000-f000-000000000011' });

      expect(Array.isArray(histories)).toBe(true);
      expect(histories.every((h) => h.designation_id === 'd0000000-0000-4000-f000-000000000011')).toBe(true);
    });

    it('should retrieve history by department', async () => {
      const histories = await db('employment_history')
        .where({ department_id: 'd0000000-0000-4000-f000-000000000001' });

      expect(Array.isArray(histories)).toBe(true);
      expect(histories.every((h) => h.department_id === 'd0000000-0000-4000-f000-000000000001')).toBe(true);
    });

    it('should retrieve history by reason', async () => {
      const histories = await db('employment_history')
        .where({ reason: 'Promotion' });

      expect(Array.isArray(histories)).toBe(true);
      expect(histories.every((h) => h.reason === 'Promotion')).toBe(true);
    });
  });

  describe('Chronological Order', () => {
    it('should maintain chronological order', async () => {
      const histories = await db('employment_history')
        .where({ employee_id: testEmployeeId })
        .orderBy('from_date', 'asc');

      for (let i = 0; i < histories.length - 1; i++) {
        const current = new Date(histories[i].from_date);
        const next = new Date(histories[i + 1].from_date);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });
  });
});
