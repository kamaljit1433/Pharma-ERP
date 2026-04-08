/**
 * FnF Settlement Repository - Unit Tests
 * Tests for Full & Final settlement CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('FnF Settlement Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testSettlementId: string;

  beforeAll(async () => {
    await db('fnf_settlements').del();
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
    await db('fnf_settlements').del();
  });

  describe('Create FnF Settlement', () => {
    it('should create FnF settlement record', async () => {
      const [settlement] = await db('fnf_settlements')
        .insert({
          employee_id: testEmployeeId,
          last_working_day: new Date().toISOString().split('T')[0],
          basic_salary: 50000,
          hra: 10000,
          dearness_allowance: 5000,
          other_allowances: 2000,
          gross_salary: 67000,
          pf_deduction: 6000,
          esi_deduction: 1000,
          income_tax: 5000,
          other_deductions: 500,
          net_payable: 54500,
          status: 'pending',
        })
        .returning('*');

      expect(settlement).toBeDefined();
      expect(settlement.id).toBeDefined();
      expect(settlement.employee_id).toBe(testEmployeeId);
      expect(settlement.status).toBe('pending');
      expect(settlement.net_payable).toBe(54500);

      testSettlementId = settlement.id;
    });
  });

  describe('Retrieve FnF Settlement', () => {
    it('should retrieve settlement by ID', async () => {
      const settlement = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      expect(settlement).toBeDefined();
      expect(settlement.id).toBe(testSettlementId);
    });

    it('should retrieve settlement by employee', async () => {
      const settlement = await db('fnf_settlements')
        .where({ employee_id: testEmployeeId })
        .first();

      expect(settlement).toBeDefined();
      expect(settlement.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent settlement', async () => {
      const settlement = await db('fnf_settlements')
        .where({ id: '00000000-0000-4000-a000-ffffffffffff' })
        .first();

      expect(settlement).toBeUndefined();
    });
  });

  describe('Update FnF Settlement', () => {
    it('should update settlement details', async () => {
      await db('fnf_settlements').where({ id: testSettlementId }).update({
        pf_deduction: 6500,
        net_payable: 54000,
      });

      const updated = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      expect(updated.pf_deduction).toBe(6500);
      expect(updated.net_payable).toBe(54000);
    });

    it('should update settlement status', async () => {
      await db('fnf_settlements').where({ id: testSettlementId }).update({
        status: 'approved',
      });

      const updated = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      expect(updated.status).toBe('approved');
    });

    it('should update payment details', async () => {
      await db('fnf_settlements').where({ id: testSettlementId }).update({
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_reference: 'TXN-12345',
      });

      const updated = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      expect(updated.status).toBe('paid');
      expect(updated.payment_reference).toBe('TXN-12345');
    });
  });

  describe('Delete FnF Settlement', () => {
    it('should delete settlement', async () => {
      const [settlement] = await db('fnf_settlements')
        .insert({
          employee_id: testEmployeeId,
          last_working_day: new Date().toISOString().split('T')[0],
          gross_salary: 50000,
          net_payable: 45000,
          status: 'pending',
        })
        .returning('*');

      await db('fnf_settlements').where({ id: settlement.id }).del();

      const deleted = await db('fnf_settlements')
        .where({ id: settlement.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query FnF Settlement', () => {
    it('should retrieve settlements by status', async () => {
      const settlements = await db('fnf_settlements')
        .where({ status: 'pending' });

      expect(Array.isArray(settlements)).toBe(true);
      expect(settlements.every((s) => s.status === 'pending')).toBe(true);
    });

    it('should retrieve paid settlements', async () => {
      const settlements = await db('fnf_settlements')
        .where({ status: 'paid' });

      expect(Array.isArray(settlements)).toBe(true);
      expect(settlements.every((s) => s.status === 'paid')).toBe(true);
    });
  });

  describe('FnF Settlement Calculations', () => {
    it('should calculate total earnings', async () => {
      const settlement = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      const totalEarnings =
        settlement.basic_salary +
        settlement.hra +
        settlement.dearness_allowance +
        settlement.other_allowances;

      expect(totalEarnings).toBe(settlement.gross_salary);
    });

    it('should calculate total deductions', async () => {
      const settlement = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      const totalDeductions =
        settlement.pf_deduction +
        settlement.esi_deduction +
        settlement.income_tax +
        settlement.other_deductions;

      const expectedNetPayable = settlement.gross_salary - totalDeductions;
      expect(expectedNetPayable).toBe(settlement.net_payable);
    });

    it('should validate net payable calculation', async () => {
      const settlement = await db('fnf_settlements')
        .where({ id: testSettlementId })
        .first();

      const calculated = settlement.gross_salary - 
        (settlement.pf_deduction + settlement.esi_deduction + settlement.income_tax + settlement.other_deductions);

      expect(calculated).toBe(settlement.net_payable);
    });
  });

  describe('Settlement Statement Fields', () => {
    it('should support statement fields', async () => {
      const [settlement] = await db('fnf_settlements')
        .insert({
          employee_id: 'emp-statement-test',
          last_working_day: new Date().toISOString().split('T')[0],
          gross_salary: 50000,
          net_payable: 45000,
          status: 'pending',
          statement_generated_date: new Date().toISOString().split('T')[0],
          statement_reference: 'STMT-001',
        })
        .returning('*');

      expect(settlement.statement_generated_date).toBeDefined();
      expect(settlement.statement_reference).toBe('STMT-001');
    });
  });
});
