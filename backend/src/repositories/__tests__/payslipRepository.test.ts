/**
 * Payslip Repository - Unit Tests
 * Tests for payslip management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PayslipRepository } from '../payslipRepository';
import db from '../../config/knex';
import { CreatePayslipDTO, UpdatePayslipDTO } from '../../types/payroll';

describe('PayslipRepository', () => {
  let repository: PayslipRepository;
  let testEmployeeId: string;
  let testPayslipId: string;

  beforeAll(async () => {
    repository = new PayslipRepository(db);

    // Clean up test data
    await db('payslips').del();
    await db('payroll').del();
    await db('employees').where('employee_id', 'EMP-PAYSLIP-001').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        employee_id: 'EMP-PAYSLIP-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'payslip-test@example.com',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');
    testEmployeeId = emp.id;

    // Create payroll records for FK references
    await db('payroll').insert([
      {
        id: 'f0000000-0000-4000-b000-000000000001',
        employee_id: testEmployeeId,
        month: 1,
        year: 2024,
        gross_salary: 60000,
        net_salary: 48000,
        total_deductions: 12000,
        total_earnings: 60000,
        status: 'processed',
      },
      {
        id: 'f0000000-0000-4000-b000-000000000002',
        employee_id: testEmployeeId,
        month: 2,
        year: 2024,
        gross_salary: 60000,
        net_salary: 48000,
        total_deductions: 12000,
        total_earnings: 60000,
        status: 'processed',
      },
    ]).onConflict('id').ignore();
  });

  afterAll(async () => {
    await db('payslips').del();
    await db('payroll').del();
    await db('employees').where('employee_id', 'EMP-PAYSLIP-001').del();
  });

  describe('createPayslip', () => {
    it('should create payslip', async () => {
      const data: CreatePayslipDTO = {
        employee_id: testEmployeeId,
        payroll_id: 'f0000000-0000-4000-b000-000000000001',
        month: 1,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        file_url: 'https://example.com/payslip.pdf',
      };

      const payslip = await repository.createPayslip(data);

      expect(payslip).toBeDefined();
      expect(payslip.id).toBeDefined();
      expect(payslip.employee_id).toBe(testEmployeeId);
      expect(payslip.month).toBe(1);
      expect(payslip.year).toBe(2024);

      testPayslipId = payslip.id;
    });
  });

  describe('getPayslip', () => {
    it('should retrieve payslip by ID', async () => {
      const payslip = await repository.getPayslip(testPayslipId);

      expect(payslip).toBeDefined();
      expect(payslip?.id).toBe(testPayslipId);
    });

    it('should return null for non-existent payslip', async () => {
      const payslip = await repository.getPayslip('00000000-0000-4000-a000-ffffffffffff');

      expect(payslip).toBeNull();
    });
  });

  describe('getEmployeePayslips', () => {
    it('should retrieve employee payslips', async () => {
      const payslips = await repository.getEmployeePayslips(testEmployeeId);

      expect(Array.isArray(payslips)).toBe(true);
      expect(payslips.length).toBeGreaterThan(0);
    });

    it('should filter by year', async () => {
      const payslips = await repository.getEmployeePayslips(testEmployeeId, 2024);

      expect(Array.isArray(payslips)).toBe(true);
    });
  });

  describe('getPayslipByMonth', () => {
    it('should retrieve payslip for specific month', async () => {
      const payslip = await repository.getPayslipByMonth(testEmployeeId, 1, 2024);

      expect(payslip).toBeDefined();
      expect(payslip?.month).toBe(1);
      expect(payslip?.year).toBe(2024);
    });

    it('should return null if payslip does not exist', async () => {
      const payslip = await repository.getPayslipByMonth(testEmployeeId, 12, 2025);

      expect(payslip).toBeNull();
    });
  });

  describe('updatePayslip', () => {
    it('should update payslip', async () => {
      const updateData: UpdatePayslipDTO = {
        file_url: 'https://example.com/payslip-updated.pdf',
      };

      const updated = await repository.updatePayslip(testPayslipId, updateData);

      expect(updated.file_url).toBe('https://example.com/payslip-updated.pdf');
    });

    it('should throw error for non-existent payslip', async () => {
      await expect(
        repository.updatePayslip('00000000-0000-4000-a000-ffffffffffff', { file_url: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('getMonthlyPayslips', () => {
    it('should retrieve all payslips for month', async () => {
      const payslips = await repository.getMonthlyPayslips(1, 2024);

      expect(Array.isArray(payslips)).toBe(true);
    });
  });

  describe('getPayslipsByYear', () => {
    it('should retrieve payslips for year', async () => {
      const payslips = await repository.getPayslipsByYear(testEmployeeId, 2024);

      expect(Array.isArray(payslips)).toBe(true);
    });
  });

  describe('getPayslipCount', () => {
    it('should count payslips', async () => {
      const count = await repository.getPayslipCount(testEmployeeId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should count by year', async () => {
      const count = await repository.getPayslipCount(testEmployeeId, 2024);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deletePayslip', () => {
    it('should delete payslip', async () => {
      const data: CreatePayslipDTO = {
        employee_id: testEmployeeId,
        payroll_id: 'f0000000-0000-4000-b000-000000000002',
        month: 2,
        year: 2024,
        basic_salary: 50000,
        gross_salary: 60000,
        net_salary: 48000,
        file_url: 'https://example.com/payslip2.pdf',
      };

      const payslip = await repository.createPayslip(data);
      await repository.deletePayslip(payslip.id);

      const deleted = await repository.getPayslip(payslip.id);
      expect(deleted).toBeNull();
    });
  });
});
