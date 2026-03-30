import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { LeaveService } from '../leaveService';

describe('LeaveService', () => {
  let db: Knex;
  let leaveService: LeaveService;
  let employeeId: string;
  let leaveTypeId: string;
  let managerId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables
    await db.schema.createTable('employees', (table) => {
      table.uuid('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.string('email').unique();
      table.uuid('reporting_manager_id').nullable();
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
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
      table.uuid('employee_id').references('id').inTable('employees');
      table.uuid('leave_type_id').references('id').inTable('leave_types');
      table.integer('year');
      table.decimal('opening_balance', 10, 2).defaultTo(0);
      table.decimal('used_balance', 10, 2).defaultTo(0);
      table.decimal('carry_forward_balance', 10, 2).defaultTo(0);
      table.decimal('available_balance', 10, 2).defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      table.unique(['employee_id', 'leave_type_id', 'year']);
    });

    await db.schema.createTable('leaves', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id').references('id').inTable('employees');
      table.uuid('leave_type_id').references('id').inTable('leave_types');
      table.date('from_date');
      table.date('to_date');
      table.decimal('days_count', 10, 2);
      table.text('reason').nullable();
      table.string('status').defaultTo('pending');
      table.uuid('approved_by').nullable();
      table.text('approval_notes').nullable();
      table.timestamp('approved_at').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    leaveService = new LeaveService(db);

    // Insert test data
    await db('employees').insert([
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        reporting_manager_id: '550e8400-e29b-41d4-a716-446655440002',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        first_name: 'Jane',
        last_name: 'Manager',
        email: 'jane@example.com',
      },
    ]);

    employeeId = '550e8400-e29b-41d4-a716-446655440001';
    managerId = '550e8400-e29b-41d4-a716-446655440002';

    await db('leave_types').insert({
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Casual Leave',
      code: 'CL',
      annual_limit: 12,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 5,
      is_active: true,
    });

    leaveTypeId = '550e8400-e29b-41d4-a716-446655440003';

    // Initialize leave balance
    await db('leave_balances').insert({
      id: '550e8400-e29b-41d4-a716-446655440004',
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year: 2026,
      opening_balance: 12,
      used_balance: 0,
      carry_forward_balance: 0,
      available_balance: 12,
    });
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('applyLeave', () => {
    it('should create a leave request with valid balance', async () => {
      const leave = await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: '2026-03-10',
        to_date: '2026-03-12',
        reason: 'Personal work',
      });

      expect(leave).toBeDefined();
      expect(leave.status).toBe('pending');
      expect(leave.days_count).toBe(3);
    });

    it('should reject leave if insufficient balance', async () => {
      await expect(
        leaveService.applyLeave({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          from_date: '2026-03-10',
          to_date: '2026-03-25',
          reason: 'Long vacation',
        })
      ).rejects.toThrow('Insufficient leave balance');
    });

    it('should reject overlapping leave requests', async () => {
      await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: '2026-03-10',
        to_date: '2026-03-12',
      });

      // Approve the first leave
      const leaves = await db('leaves').where({ employee_id: employeeId });
      await db('leaves')
        .where({ id: leaves[0].id })
        .update({ status: 'approved' });

      await expect(
        leaveService.applyLeave({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          from_date: '2026-03-11',
          to_date: '2026-03-13',
        })
      ).rejects.toThrow('Leave already exists');
    });
  });

  describe('approveLeave', () => {
    it('should approve pending leave and deduct balance', async () => {
      const leave = await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: '2026-03-10',
        to_date: '2026-03-12',
      });

      await leaveService.approveLeave(leave.id, managerId);

      const updatedLeave = await db('leaves').where({ id: leave.id }).first();
      expect(updatedLeave.status).toBe('approved');
      expect(updatedLeave.approved_by).toBe(managerId);

      const balance = await db('leave_balances')
        .where({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: 2026,
        })
        .first();

      expect(balance.used_balance).toBe(3);
      expect(balance.available_balance).toBe(9);
    });

    it('should reject approval of non-pending leave', async () => {
      const leave = await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: '2026-03-10',
        to_date: '2026-03-12',
      });

      await leaveService.approveLeave(leave.id, managerId);

      await expect(
        leaveService.approveLeave(leave.id, managerId)
      ).rejects.toThrow('Only pending leave requests can be approved');
    });
  });

  describe('rejectLeave', () => {
    it('should reject pending leave', async () => {
      const leave = await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        from_date: '2026-03-10',
        to_date: '2026-03-12',
      });

      await leaveService.rejectLeave(leave.id, managerId, 'Not approved');

      const updatedLeave = await db('leaves').where({ id: leave.id }).first();
      expect(updatedLeave.status).toBe('rejected');
      expect(updatedLeave.approval_notes).toBe('Not approved');
    });
  });

  describe('getLeaveBalance', () => {
    it('should return leave balances for employee', async () => {
      const balances = await leaveService.getLeaveBalance(employeeId, 2026);

      expect(balances).toHaveLength(1);
      expect(balances[0]?.available_balance).toBe(12);
      expect(balances[0]?.used_balance).toBe(0);
    });
  });

  describe('applyCarryForwardRules', () => {
    it('should carry forward unused leave to next year', async () => {
      // Create balance for previous year with unused days
      await db('leave_balances').insert({
        id: '550e8400-e29b-41d4-a716-446655440005',
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year: 2025,
        opening_balance: 12,
        used_balance: 5,
        carry_forward_balance: 0,
        available_balance: 7,
      });

      await leaveService.applyCarryForwardRules(2026);

      const newBalance = await db('leave_balances')
        .where({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: 2026,
        })
        .first();

      expect(newBalance.carry_forward_balance).toBe(5);
      expect(newBalance.available_balance).toBe(17);
    });

    it('should respect carry-forward limit', async () => {
      await db('leave_balances').insert({
        id: '550e8400-e29b-41d4-a716-446655440005',
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year: 2025,
        opening_balance: 12,
        used_balance: 0,
        carry_forward_balance: 0,
        available_balance: 12,
      });

      await leaveService.applyCarryForwardRules(2026);

      const newBalance = await db('leave_balances')
        .where({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: 2026,
        })
        .first();

      expect(newBalance.carry_forward_balance).toBe(5);
    });
  });
});
