/**
 * Payroll Repository - Unit Tests
 * Tests for payroll records, salary structures, and payslips
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PayrollRepository } from '../payrollRepository';
import db from '../../config/knex';
import { CreatePayrollDTO, UpdatePayrollDTO } from '../../types/payroll';

describe('PayrollRepository', () => {
  let repository: PayrollRepository;
  const testEmployeeId = 'e0000000-0000-4000-a000-000000000099';
  let testPayrollId: string;

  beforeAll(async () => {
    repository = new PayrollRepository(db);

    // Ensure test employee exists
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-PAYROLL-001',
        first_name: 'Payroll',
        last_name: 'Test',
        email: 'payroll.test@example.com',
        employment_type: 'permanent',
        status: 'active',
        date_of_joining: new Date(),
      })
      .onConflict('id').ignore();

    // Clean up test data
    await db('payroll').where({ employee_id: testEmployeeId }).del();
  });

  afterAll(async () => {
    await db('payroll').where({ employee_id: testEmployeeId }).del();
  });

  describe('createPayroll', () => {
    it('should create payroll record', async () => {
      const data: CreatePayrollDTO = {
        employee_id: testEmployeeId,
        month: 1,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        status: 'draft',
      };

      const payroll = await repository.createPayroll(data);

      expect(payroll).toBeDefined();
      expect(payroll.id).toBeDefined();
      expect(payroll.employee_id).toBe(testEmployeeId);
      expect(payroll.status).toBe('draft');
      expect(payroll.basic_salary).toBe(50000);

      testPayrollId = payroll.id;
    });

    it('should create payroll with deductions', async () => {
      const data: CreatePayrollDTO = {
        employee_id: testEmployeeId,
        month: 2,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        pf_deduction: 6000,
        esi_deduction: 1200,
        tds_deduction: 4800,
        status: 'draft',
      };

      const payroll = await repository.createPayroll(data);

      expect(payroll.pf_deduction).toBe(6000);
      expect(payroll.esi_deduction).toBe(1200);
      expect(payroll.tds_deduction).toBe(4800);
    });
  });

  describe('getPayroll', () => {
    it('should retrieve payroll by ID', async () => {
      const payroll = await repository.getPayroll(testPayrollId);

      expect(payroll).toBeDefined();
      expect(payroll?.id).toBe(testPayrollId);
    });

    it('should return null for non-existent payroll', async () => {
      const payroll = await repository.getPayroll('00000000-0000-4000-a000-ffffffffffff');

      expect(payroll).toBeNull();
    });
  });

  describe('updatePayroll', () => {
    it('should update payroll status', async () => {
      const updateData: UpdatePayrollDTO = {
        status: 'processed',
        processed_date: new Date(),
      };

      const updated = await repository.updatePayroll(testPayrollId, updateData);

      expect(updated.status).toBe('processed');
      expect(updated.processed_date).toBeDefined();
    });

    it('should throw error for non-existent payroll', async () => {
      await expect(
        repository.updatePayroll('00000000-0000-4000-a000-ffffffffffff', { status: 'processed' })
      ).rejects.toThrow();
    });
  });

  describe('getEmployeePayroll', () => {
    it('should retrieve employee payroll for month', async () => {
      const payroll = await repository.getEmployeePayroll(testEmployeeId, 1, 2024);

      expect(payroll).toBeDefined();
      expect(payroll?.employee_id).toBe(testEmployeeId);
    });

    it('should return null if no payroll exists', async () => {
      const payroll = await repository.getEmployeePayroll(testEmployeeId, 12, 2025);

      expect(payroll).toBeNull();
    });
  });

  describe('getEmployeePayrollHistory', () => {
    it('should retrieve employee payroll history', async () => {
      const history = await repository.getEmployeePayrollHistory(testEmployeeId);

      expect(Array.isArray(history)).toBe(true);
    });

    it('should filter by year', async () => {
      const history = await repository.getEmployeePayrollHistory(testEmployeeId, 2024);

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getMonthlyPayroll', () => {
    it('should retrieve all payroll for month', async () => {
      const payroll = await repository.getMonthlyPayroll(1, 2024);

      expect(Array.isArray(payroll)).toBe(true);
    });
  });

  describe('getPayrollByStatus', () => {
    it('should retrieve payroll by status', async () => {
      const payroll = await repository.getPayrollByStatus('draft');

      expect(Array.isArray(payroll)).toBe(true);
    });

    it('should filter by month and year', async () => {
      const payroll = await repository.getPayrollByStatus('draft', 1, 2024);

      expect(Array.isArray(payroll)).toBe(true);
    });
  });

  describe('lockPayroll', () => {
    it('should lock payroll record', async () => {
      const data: CreatePayrollDTO = {
        employee_id: testEmployeeId,
        month: 3,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        status: 'processed',
      };

      const payroll = await repository.createPayroll(data);
      const locked = await repository.lockPayroll(payroll.id);

      expect(locked.is_locked).toBe(true);
      expect(locked.locked_at).toBeDefined();
    });
  });

  describe('unlockPayroll', () => {
    it('should unlock payroll record', async () => {
      const data: CreatePayrollDTO = {
        employee_id: testEmployeeId,
        month: 4,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        status: 'processed',
      };

      const payroll = await repository.createPayroll(data);
      await repository.lockPayroll(payroll.id);
      const unlocked = await repository.unlockPayroll(payroll.id);

      expect(unlocked.is_locked).toBe(false);
    });
  });

  describe('getPayrollCount', () => {
    it('should count payroll records', async () => {
      const count = await repository.getPayrollCount(1, 2024);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count by status', async () => {
      const count = await repository.getPayrollCount(1, 2024, 'draft');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getTotalPayrollAmount', () => {
    it('should calculate total payroll amount', async () => {
      const total = await repository.getTotalPayrollAmount(1, 2024);

      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPayrollSummary', () => {
    it('should get payroll summary for period', async () => {
      const summary = await repository.getPayrollSummary(1, 2024);

      expect(summary).toBeDefined();
      expect(summary.total_employees).toBeDefined();
      expect(summary.total_gross_salary).toBeDefined();
      expect(summary.total_net_salary).toBeDefined();
    });
  });

  describe('deletePayroll', () => {
    it('should delete payroll record', async () => {
      const data: CreatePayrollDTO = {
        employee_id: testEmployeeId,
        month: 5,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        status: 'draft',
      };

      const payroll = await repository.createPayroll(data);
      await repository.deletePayroll(payroll.id);

      const deleted = await repository.getPayroll(payroll.id);
      expect(deleted).toBeNull();
    });
  });
});
