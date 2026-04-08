/**
 * Geo Log Repository - Unit Tests
 * Tests for GPS tracking log CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Geo Log Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testLogId: string;

  beforeAll(async () => {
    await db('geo_logs').del();
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
    await db('geo_logs').del();
  });

  describe('Create Geo Log', () => {
    it('should create GPS tracking log', async () => {
      const [log] = await db('geo_logs')
        .insert({
          employee_id: testEmployeeId,
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 10,
          timestamp: new Date(),
          location_name: 'Office',
          activity_type: 'check_in',
        })
        .returning('*');

      expect(log).toBeDefined();
      expect(log.id).toBeDefined();
      expect(log.employee_id).toBe(testEmployeeId);
      expect(log.latitude).toBe(28.6139);
      expect(log.longitude).toBe(77.209);

      testLogId = log.id;
    });

    it('should support different activity types', async () => {
      const types = ['check_in', 'check_out', 'travel', 'break', 'meeting'];

      for (const type of types) {
        const [log] = await db('geo_logs')
          .insert({
            employee_id: testEmployeeId,
            latitude: 28.6139,
            longitude: 77.209,
            activity_type: type,
            timestamp: new Date(),
          })
          .returning('*');

        expect(log.activity_type).toBe(type);
      }
    });
  });

  describe('Retrieve Geo Log', () => {
    it('should retrieve log by ID', async () => {
      const log = await db('geo_logs')
        .where({ id: testLogId })
        .first();

      expect(log).toBeDefined();
      expect(log.id).toBe(testLogId);
    });

    it('should retrieve logs for employee', async () => {
      const logs = await db('geo_logs')
        .where({ employee_id: testEmployeeId });

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.employee_id === testEmployeeId)).toBe(true);
    });

    it('should retrieve logs by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();

      const logs = await db('geo_logs')
        .where({ employee_id: testEmployeeId })
        .whereRaw('timestamp >= ?', [startDate])
        .whereRaw('timestamp <= ?', [endDate]);

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should return empty array for employee with no logs', async () => {
      const logs = await db('geo_logs')
        .where({ employee_id: 'emp-no-logs' });

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });
  });

  describe('Update Geo Log', () => {
    it('should update location name', async () => {
      await db('geo_logs').where({ id: testLogId }).update({
        location_name: 'Updated Location',
      });

      const updated = await db('geo_logs')
        .where({ id: testLogId })
        .first();

      expect(updated.location_name).toBe('Updated Location');
    });

    it('should update activity type', async () => {
      await db('geo_logs').where({ id: testLogId }).update({
        activity_type: 'travel',
      });

      const updated = await db('geo_logs')
        .where({ id: testLogId })
        .first();

      expect(updated.activity_type).toBe('travel');
    });
  });

  describe('Delete Geo Log', () => {
    it('should delete geo log', async () => {
      const [log] = await db('geo_logs')
        .insert({
          employee_id: testEmployeeId,
          latitude: 28.6139,
          longitude: 77.209,
          timestamp: new Date(),
        })
        .returning('*');

      await db('geo_logs').where({ id: log.id }).del();

      const deleted = await db('geo_logs')
        .where({ id: log.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Geo Logs', () => {
    it('should retrieve logs by activity type', async () => {
      const logs = await db('geo_logs')
        .where({ activity_type: 'check_in' });

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.activity_type === 'check_in')).toBe(true);
    });

    it('should retrieve logs by location', async () => {
      const logs = await db('geo_logs')
        .where({ location_name: 'Office' });

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.location_name === 'Office')).toBe(true);
    });

    it('should retrieve logs with accuracy threshold', async () => {
      const logs = await db('geo_logs')
        .where('accuracy', '<=', 50);

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.accuracy <= 50)).toBe(true);
    });
  });

  describe('Geo Log Analytics', () => {
    it('should count logs per employee', async () => {
      const result = await db('geo_logs')
        .where({ employee_id: testEmployeeId })
        .count('* as count')
        .first();

      expect(result?.count).toBeGreaterThanOrEqual(0);
    });

    it('should get latest log for employee', async () => {
      const log = await db('geo_logs')
        .where({ employee_id: testEmployeeId })
        .orderBy('timestamp', 'desc')
        .first();

      expect(log).toBeDefined();
      expect(log.employee_id).toBe(testEmployeeId);
    });

    it('should calculate average accuracy', async () => {
      const result = await db('geo_logs')
        .where({ employee_id: testEmployeeId })
        .avg('accuracy as avg_accuracy')
        .first();

      expect(result).toBeDefined();
    });
  });

  describe('Journey Tracking', () => {
    it('should retrieve sequential logs for journey', async () => {
      const logs = await db('geo_logs')
        .where({ employee_id: testEmployeeId })
        .orderBy('timestamp', 'asc');

      expect(Array.isArray(logs)).toBe(true);
      if (logs.length > 1) {
        for (let i = 0; i < logs.length - 1; i++) {
          expect(new Date(logs[i].timestamp).getTime()).toBeLessThanOrEqual(
            new Date(logs[i + 1].timestamp).getTime()
          );
        }
      }
    });
  });
});
