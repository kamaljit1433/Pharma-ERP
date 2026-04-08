/**
 * Audit Log Utility Tests
 * Tests for audit logging functions
 */

import { logAuditEvent, getAuditLogs, getAuditLogsByAction } from '../auditLog';
import knex from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('Audit Log Utilities', () => {
  beforeAll(async () => {
    // Ensure audit_logs table exists with correct schema
    const hasTable = await knex.schema.hasTable('audit_logs');
    if (!hasTable) {
      await knex.schema.createTable('audit_logs', (table: any) => {
        table.uuid('id').primary();
        table.string('entity_type').notNullable().index();
        table.uuid('entity_id').notNullable().index();
        table.string('action').notNullable();
        table.uuid('performed_by').nullable();
        table.jsonb('changes').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      });
    }
  });

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clear audit logs before each test
    await knex('audit_logs').del();
  });

  describe('logAuditEvent', () => {
    it('should log an audit event', async () => {
      const entityId = uuidv4();
      const userId = uuidv4();
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'CREATE',
        { name: 'John Doe' },
        userId
      );

      const logs = await knex('audit_logs').select();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('CREATE');
      expect(logs[0].entity_type).toBe('employee');
    });

    it('should handle optional fields', async () => {
      const entityId = uuidv4();
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'UPDATE',
        undefined,
        undefined
      );

      const logs = await knex('audit_logs').select();
      expect(logs.length).toBe(1);
      expect(logs[0].changes).toBeNull();
    });

    it('should store changes as JSON', async () => {
      const entityId = uuidv4();
      const changes = {
        name: { old: 'John', new: 'Jane' },
        email: { old: 'john@example.com', new: 'jane@example.com' },
      };

      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'UPDATE',
        changes,
        uuidv4()
      );

      const logs = await knex('audit_logs').select();
      expect(logs[0].changes).toEqual(changes);
    });

    it('should set timestamp automatically', async () => {
      const entityId = uuidv4();
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'DELETE',
        undefined,
        uuidv4()
      );

      const logs = await knex('audit_logs').select();
      expect(logs[0].created_at).toBeDefined();
    });

    it('should handle multiple events', async () => {
      await logAuditEvent(knex, 'employee', uuidv4(), 'CREATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', uuidv4(), 'UPDATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', uuidv4(), 'DELETE', undefined, uuidv4());

      const logs = await knex('audit_logs').select();
      expect(logs.length).toBe(3);
    });
  });

  describe('getAuditLogs', () => {
    let emp1Id: string, emp2Id: string, emp3Id: string;

    beforeEach(async () => {
      // Insert test data using the actual function
      emp1Id = uuidv4();
      emp2Id = uuidv4();
      emp3Id = uuidv4();
      await logAuditEvent(knex, 'employee', emp1Id, 'CREATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', emp2Id, 'UPDATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', emp3Id, 'DELETE', undefined, uuidv4());
    });

    it('should retrieve audit logs for an entity', async () => {
      const logs = await getAuditLogs(knex, 'employee', emp1Id);

      expect(logs.length).toBe(1);
      expect(logs[0]?.entity_id).toBe(emp1Id);
    });

    it('should filter by entity type and ID', async () => {
      const logs = await getAuditLogs(knex, 'employee', emp2Id);

      expect(logs.length).toBe(1);
      expect(logs.every(log => log.entity_type === 'employee')).toBe(true);
      expect(logs[0]?.entity_id).toBe(emp2Id);
    });

    it('should support pagination', async () => {
      // Add more logs for the same entity
      await logAuditEvent(knex, 'employee', emp1Id, 'UPDATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', emp1Id, 'DELETE', undefined, uuidv4());

      const logs = await getAuditLogs(knex, 'employee', emp1Id, 2, 0);

      expect(logs.length).toBe(2);
    });

    it('should sort by date descending', async () => {
      // Add more logs for the same entity
      await logAuditEvent(knex, 'employee', emp1Id, 'UPDATE', undefined, uuidv4());
      
      const logs = await getAuditLogs(knex, 'employee', emp1Id);

      expect(logs.length).toBe(2);
      expect(logs[0]!.created_at >= logs[1]!.created_at).toBe(true);
    });

    it('should handle empty results', async () => {
      const logs = await getAuditLogs(knex, 'employee', uuidv4());

      expect(logs.length).toBe(0);
    });
  });

  describe('getAuditLogsByAction', () => {
    beforeEach(async () => {
      await logAuditEvent(knex, 'employee', uuidv4(), 'CREATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', uuidv4(), 'CREATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', uuidv4(), 'UPDATE', undefined, uuidv4());
      await logAuditEvent(knex, 'employee', uuidv4(), 'DELETE', undefined, uuidv4());
    });

    it('should retrieve logs by action', async () => {
      const logs = await getAuditLogsByAction(knex, 'CREATE');

      expect(logs.length).toBe(2);
      expect(logs.every(log => log.action === 'CREATE')).toBe(true);
    });

    it('should handle UPDATE action', async () => {
      const logs = await getAuditLogsByAction(knex, 'UPDATE');

      expect(logs.length).toBe(1);
      expect(logs[0]?.action).toBe('UPDATE');
    });

    it('should handle DELETE action', async () => {
      const logs = await getAuditLogsByAction(knex, 'DELETE');

      expect(logs.length).toBe(1);
      expect(logs[0]?.action).toBe('DELETE');
    });

    it('should return empty for non-existent action', async () => {
      const logs = await getAuditLogsByAction(knex, 'INVALID');

      expect(logs.length).toBe(0);
    });

    it('should support pagination', async () => {
      const logs = await getAuditLogsByAction(knex, 'CREATE', 1, 0);

      expect(logs.length).toBe(1);
    });

    it('should be case-sensitive', async () => {
      const logs = await getAuditLogsByAction(knex, 'create');

      expect(logs.length).toBe(0);
    });
  });

  describe('Integration tests', () => {
    it('should log and retrieve employee creation', async () => {
      const entityId = uuidv4();
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'CREATE',
        { name: 'John Doe', email: 'john@example.com' },
        uuidv4()
      );

      const logs = await getAuditLogsByAction(knex, 'CREATE');
      expect(logs.length).toBe(1);
      expect(logs[0]?.entity_id).toBe(entityId);
    });

    it('should maintain audit trail for entity', async () => {
      const entityId = uuidv4();

      // Create
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'CREATE',
        { name: 'John' },
        uuidv4()
      );

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'UPDATE',
        { name: { old: 'John', new: 'Jane' } },
        uuidv4()
      );

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      // Delete
      await logAuditEvent(
        knex,
        'employee',
        entityId,
        'DELETE',
        undefined,
        uuidv4()
      );

      const logs = await getAuditLogs(knex, 'employee', entityId);
      expect(logs.length).toBe(3);
      // Logs are sorted by created_at desc, so most recent first
      expect(logs[0]?.action).toBe('DELETE');
      expect(logs[1]?.action).toBe('UPDATE');
      expect(logs[2]?.action).toBe('CREATE');
    });
  });
});
