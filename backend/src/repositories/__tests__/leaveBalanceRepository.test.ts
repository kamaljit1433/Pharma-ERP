/**
 * Leave Balance Repository - Unit Tests
 * Tests for leave balance CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Leave Balance Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  const leaveTypeId1 = 'e0000000-0000-4000-b000-000000000001';
  const leaveTypeId2 = 'e0000000-0000-4000-b000-000000000002';
  let testBalanceId: string;

  beforeAll(async () => {
    await db('leave_balances').del();
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
      .onConflict('id').ignore();

    await db('leave_types')
      .insert([
        { id: leaveTypeId1, name: 'Annual Leave', code: 'AL', annual_limit: 20, is_paid: true, requires_approval: true, carry_forward_limit: 5, is_active: true },
        { id: leaveTypeId2, name: 'Sick Leave', code: 'SL', annual_limit: 10, is_paid: true, requires_approval: false, carry_forward_limit: 0, is_active: true },
      ])
      .onConflict('id').ignore();
  });

  afterAll(async () => {
    await db('leave_balances').del();
    await db('leave_types').whereIn('id', [leaveTypeId1, leaveTypeId2]).del();
    await db('employees').where('id', testEmployeeId).del();
  });

  describe('Create Leave Balance', () => {
    it('should create leave balance', async () => {
      const [balance] = await db('leave_balances')
        .insert({
          employee_id: testEmployeeId,
          leave_type_id: leaveTypeId1,
          year: new Date().getFullYear(),
          opening_balance: 20,
          used_balance: 0,
          carry_forward_balance: 0,
          available_balance: 20,
        })
        .returning('*');

      expect(balance).toBeDefined();
      expect(balance.id).toBeDefined();
      expect(balance.employee_id).toBe(testEmployeeId);
      expect(Number(balance.opening_balance)).toBe(20);
      expect(Number(balance.available_balance)).toBe(20);

      testBalanceId = balance.id;
    });
  });

  describe('Retrieve Leave Balance', () => {
    it('should retrieve balance by ID', async () => {
      const balance = await db('leave_balances')
        .where({ id: testBalanceId })
        .first();

      expect(balance).toBeDefined();
      expect(balance.id).toBe(testBalanceId);
    });

    it('should retrieve balance by employee and year', async () => {
      const year = new Date().getFullYear();
      const balance = await db('leave_balances')
        .where({ employee_id: testEmployeeId, year })
        .first();

      expect(balance).toBeDefined();
      expect(balance.employee_id).toBe(testEmployeeId);
      expect(balance.year).toBe(year);
    });

    it('should retrieve all balances for employee', async () => {
      const balances = await db('leave_balances')
        .where({ employee_id: testEmployeeId });

      expect(Array.isArray(balances)).toBe(true);
      expect(balances.every((b) => b.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no balances', async () => {
      const balances = await db('leave_balances')
        .where({ employee_id: '00000000-0000-4000-a000-ffffffffffff' });

      expect(Array.isArray(balances)).toBe(true);
      expect(balances.length).toBe(0);
    });
  });

  describe('Update Leave Balance', () => {
    it('should update used leaves', async () => {
      await db('leave_balances').where({ id: testBalanceId }).update({
        used_balance: 5,
        available_balance: 15,
      });

      const updated = await db('leave_balances')
        .where({ id: testBalanceId })
        .first();

      expect(Number(updated.used_balance)).toBe(5);
      expect(Number(updated.available_balance)).toBe(15);
    });

    it('should update carried forward leaves', async () => {
      await db('leave_balances').where({ id: testBalanceId }).update({
        carry_forward_balance: 3,
      });

      const updated = await db('leave_balances')
        .where({ id: testBalanceId })
        .first();

      expect(Number(updated.carry_forward_balance)).toBe(3);
    });
  });

  describe('Delete Leave Balance', () => {
    it('should delete leave balance', async () => {
      const [balance] = await db('leave_balances')
        .insert({
          employee_id: testEmployeeId,
          leave_type_id: leaveTypeId2,
          year: new Date().getFullYear(),
          opening_balance: 10,
          used_balance: 0,
          carry_forward_balance: 0,
          available_balance: 10,
        })
        .returning('*');

      await db('leave_balances').where({ id: balance.id }).del();

      const deleted = await db('leave_balances')
        .where({ id: balance.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Leave Balance', () => {
    it('should retrieve balances by leave type', async () => {
      const balances = await db('leave_balances')
        .where({ leave_type_id: leaveTypeId1 });

      expect(Array.isArray(balances)).toBe(true);
      expect(balances.every((b) => b.leave_type_id === leaveTypeId1)).toBe(true);
    });

    it('should retrieve balances by year', async () => {
      const year = new Date().getFullYear();
      const balances = await db('leave_balances')
        .where({ year });

      expect(Array.isArray(balances)).toBe(true);
      expect(balances.every((b) => b.year === year)).toBe(true);
    });
  });

  describe('Leave Balance Calculations', () => {
    it('should calculate available balance', async () => {
      const balance = await db('leave_balances')
        .where({ id: testBalanceId })
        .first();

      const available = Number(balance.opening_balance) + Number(balance.carry_forward_balance) - Number(balance.used_balance);
      expect(available).toBeGreaterThanOrEqual(0);
      expect(Number(balance.available_balance)).toBeGreaterThanOrEqual(0);
    });

    it('should track leave utilization', async () => {
      const balance = await db('leave_balances')
        .where({ id: testBalanceId })
        .first();

      const total = Number(balance.opening_balance) + Number(balance.carry_forward_balance);
      const utilization = (Number(balance.used_balance) / total) * 100;
      expect(utilization).toBeGreaterThanOrEqual(0);
      expect(utilization).toBeLessThanOrEqual(100);
    });
  });
});
