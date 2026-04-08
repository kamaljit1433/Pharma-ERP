/**
 * Audit Log Repository - Unit Tests
 * Tests for audit log CRUD operations and querying
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuditLogRepository } from '../auditLogRepository';
import db from '../../config/knex';

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let testLogId: string;

  beforeAll(async () => {
    repository = new AuditLogRepository(db);
    await db('audit_logs').del();
  });

  afterAll(async () => {
    await db('audit_logs').del();
  });

  describe('createLog', () => {
    it('should create an audit log entry', async () => {
      const log = await repository.createLog({
        user_id: 'c0000000-0000-4000-a000-000000000701',
        action: 'CREATE',
        entity_type: 'employee',
        entity_id: 'a0000000-0000-4000-a000-000000000001',
        changes: { first_name: 'John', last_name: 'Doe' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });

      expect(log).toBeDefined();
      expect(log.id).toBeDefined();
      expect(log.user_id).toBe('c0000000-0000-4000-a000-000000000701');
      expect(log.action).toBe('CREATE');
      expect(log.entity_type).toBe('employee');
      expect(log.entity_id).toBe('a0000000-0000-4000-a000-000000000001');
      expect(log.created_at).toBeDefined();

      testLogId = log.id;
    });
  });

  describe('getLogById', () => {
    it('should retrieve log by ID', async () => {
      const log = await repository.getLogById(testLogId);

      expect(log).toBeDefined();
      expect(log?.id).toBe(testLogId);
      expect(log?.action).toBe('CREATE');
    });

    it('should return null for non-existent log', async () => {
      const log = await repository.getLogById('00000000-0000-4000-a000-ffffffffffff');

      expect(log).toBeNull();
    });
  });

  describe('getLogsByUser', () => {
    it('should retrieve logs for a specific user', async () => {
      const logs = await repository.getLogsByUser('c0000000-0000-4000-a000-000000000701');

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.every((l) => l.user_id === 'c0000000-0000-4000-a000-000000000701')).toBe(true);
    });

    it('should return empty array for user with no logs', async () => {
      const logs = await repository.getLogsByUser('user-no-logs');

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBe(0);
    });
  });

  describe('getLogsByEntity', () => {
    it('should retrieve logs for a specific entity', async () => {
      const logs = await repository.getLogsByEntity('employee', 'a0000000-0000-4000-a000-000000000001');

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.entity_type === 'employee' && l.entity_id === 'a0000000-0000-4000-a000-000000000001')).toBe(
        true
      );
    });
  });

  describe('getLogsByAction', () => {
    it('should retrieve logs by action type', async () => {
      const logs = await repository.getLogsByAction('CREATE');

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.every((l) => l.action === 'CREATE')).toBe(true);
    });
  });

  describe('getLogsByDateRange', () => {
    it('should retrieve logs within date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();

      const logs = await repository.getLogsByDateRange(startDate, endDate);

      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.created_at.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(log.created_at.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('getAllLogs', () => {
    it('should retrieve all logs', async () => {
      const logs = await repository.getAllLogs();

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await repository.getAllLogs(10, 0);
      const page2 = await repository.getAllLogs(10, 10);

      expect(page1.length).toBeLessThanOrEqual(10);
      expect(page2.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getLogCount', () => {
    it('should count all logs', async () => {
      const count = await repository.getLogCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should count logs by user', async () => {
      const count = await repository.getLogCount('c0000000-0000-4000-a000-000000000701');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('deleteOldLogs', () => {
    it('should delete logs older than specified days', async () => {
      const beforeCount = await repository.getLogCount();

      // Delete logs older than 0 days (should delete nothing)
      await repository.deleteOldLogs(0);

      const afterCount = await repository.getLogCount();

      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    });
  });
});
