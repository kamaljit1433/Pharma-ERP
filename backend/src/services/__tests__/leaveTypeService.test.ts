import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { LeaveTypeService } from '../leaveTypeService';

describe('LeaveTypeService', () => {
  let db: Knex;
  let leaveTypeService: LeaveTypeService;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    await db.schema.createTable('leave_types', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('code').unique();
      table.integer('annual_limit');
      table.boolean('is_paid').defaultTo(true);
      table.boolean('requires_approval').defaultTo(true);
      table.integer('carry_forward_limit').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('leave_balances', (table) => {
      table.uuid('id').primary();
      table.uuid('leave_type_id').references('id').inTable('leave_types');
      table.integer('year');
    });

    leaveTypeService = new LeaveTypeService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('createLeaveType', () => {
    it('should create a new leave type', async () => {
      const leaveType = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
        is_paid: true,
        requires_approval: true,
        carry_forward_limit: 5,
      });

      expect(leaveType).toBeDefined();
      expect(leaveType.name).toBe('Casual Leave');
      expect(leaveType.code).toBe('CL');
      expect(leaveType.annual_limit).toBe(12);
      expect(leaveType.is_active).toBe(true);
    });

    it('should reject duplicate leave type code', async () => {
      await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      await expect(
        leaveTypeService.createLeaveType({
          name: 'Casual Leave 2',
          code: 'CL',
          annual_limit: 10,
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('getLeaveType', () => {
    it('should retrieve leave type by id', async () => {
      const created = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      const retrieved = await leaveTypeService.getLeaveType(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Casual Leave');
    });

    it('should throw error for non-existent leave type', async () => {
      await expect(
        leaveTypeService.getLeaveType('non-existent-id')
      ).rejects.toThrow('not found');
    });
  });

  describe('getAllLeaveTypes', () => {
    it('should return all active leave types', async () => {
      await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      await leaveTypeService.createLeaveType({
        name: 'Sick Leave',
        code: 'SL',
        annual_limit: 10,
      });

      const types = await leaveTypeService.getAllLeaveTypes();

      expect(types).toHaveLength(2);
    });
  });

  describe('updateLeaveType', () => {
    it('should update leave type', async () => {
      const created = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      const updated = await leaveTypeService.updateLeaveType(created.id, {
        annual_limit: 15,
      });

      expect(updated.annual_limit).toBe(15);
    });
  });

  describe('deactivateLeaveType', () => {
    it('should deactivate leave type', async () => {
      const created = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      const deactivated = await leaveTypeService.deactivateLeaveType(
        created.id
      );

      expect(deactivated.is_active).toBe(false);
    });
  });

  describe('deleteLeaveType', () => {
    it('should delete leave type without balances', async () => {
      const created = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      await leaveTypeService.deleteLeaveType(created.id);

      await expect(
        leaveTypeService.getLeaveType(created.id)
      ).rejects.toThrow('not found');
    });

    it('should reject deletion if balances exist', async () => {
      const created = await leaveTypeService.createLeaveType({
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
      });

      await db('leave_balances').insert({
        id: '550e8400-e29b-41d4-a716-446655440001',
        leave_type_id: created.id,
        year: 2026,
      });

      await expect(
        leaveTypeService.deleteLeaveType(created.id)
      ).rejects.toThrow('Cannot delete');
    });
  });
});
