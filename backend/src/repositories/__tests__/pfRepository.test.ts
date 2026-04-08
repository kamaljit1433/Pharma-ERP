/**
 * PF (Provident Fund) Repository - Unit Tests
 * Tests for PF CRUD operations and calculations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PFRepository } from '../pfRepository';
import db from '../../config/knex';

describe('PFRepository', () => {
  let repository: PFRepository;
  let testPFId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new PFRepository(db);

    // Clean up test data
    await db('pf_accounts').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000004',
        employee_id: 'EMP-PF-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date('2020-01-01'),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('pf_accounts').del();
    await db('employees').del();
  });

  describe('createPFAccount', () => {
    it('should create a PF account with valid data', async () => {
      const pfAccount = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF123456789',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      expect(pfAccount).toBeDefined();
      expect(pfAccount.id).toBeDefined();
      expect(pfAccount.employee_id).toBe(testEmployeeId);
      expect(pfAccount.pf_number).toBe('PF123456789');
      expect(pfAccount.employee_contribution_rate).toBe(12);
      expect(pfAccount.employer_contribution_rate).toBe(12);

      testPFId = pfAccount.id;
    });
  });

  describe('getPFAccountById', () => {
    it('should retrieve PF account by ID', async () => {
      const pfAccount = await repository.getPFAccountById(testPFId);

      expect(pfAccount).toBeDefined();
      expect(pfAccount?.id).toBe(testPFId);
      expect(pfAccount?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const pfAccount = await repository.getPFAccountById('00000000-0000-4000-a000-ffffffffffff');
      expect(pfAccount).toBeNull();
    });
  });

  describe('getPFAccountByEmployee', () => {
    it('should retrieve PF account by employee ID', async () => {
      const pfAccount = await repository.getPFAccountByEmployee(testEmployeeId);

      expect(pfAccount).toBeDefined();
      expect(pfAccount?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for employee without PF account', async () => {
      const pfAccount = await repository.getPFAccountByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(pfAccount).toBeNull();
    });
  });

  describe('updatePFAccount', () => {
    it('should update PF account properties', async () => {
      const updated = await repository.updatePFAccount(testPFId, {
        employee_contribution_rate: 13,
        employer_contribution_rate: 13,
      });

      expect(updated.employee_contribution_rate).toBe(13);
      expect(updated.employer_contribution_rate).toBe(13);
    });

    it('should update account status', async () => {
      const updated = await repository.updatePFAccount(testPFId, {
        account_status: 'inactive',
      });

      expect(updated.account_status).toBe('inactive');
    });
  });

  describe('recordContribution', () => {
    it('should record a PF contribution', async () => {
      const contribution = await repository.recordContribution(testPFId, {
        month: 6,
        year: 2024,
        employee_contribution: 5000,
        employer_contribution: 5000,
        total_contribution: 10000,
      });

      expect(contribution).toBeDefined();
      expect(contribution.employee_contribution).toBe(5000);
      expect(contribution.employer_contribution).toBe(5000);
      expect(contribution.total_contribution).toBe(10000);
    });
  });

  describe('getContributions', () => {
    it('should retrieve PF contributions', async () => {
      const contributions = await repository.getContributions(testPFId);

      expect(Array.isArray(contributions)).toBe(true);
      expect(contributions.length).toBeGreaterThan(0);
    });

    it('should return empty array for account without contributions', async () => {
      const pfAccount = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF987654321',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      const contributions = await repository.getContributions(pfAccount.id);
      expect(contributions).toEqual([]);
    });
  });

  describe('getBalance', () => {
    it('should calculate PF balance', async () => {
      const balance = await repository.getBalance(testPFId);

      expect(balance).toBeDefined();
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deletePFAccount', () => {
    it('should delete a PF account', async () => {
      const pfAccount = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF111111111',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      await repository.deletePFAccount(pfAccount.id);

      const deleted = await repository.getPFAccountById(pfAccount.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF222222222',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getPFAccountById(created.id);
      expect(read?.pf_number).toBe('PF222222222');

      // Update
      const updated = await repository.updatePFAccount(created.id, {
        employee_contribution_rate: 14,
      });

      expect(updated.employee_contribution_rate).toBe(14);

      // Delete
      await repository.deletePFAccount(created.id);
      const deleted = await repository.getPFAccountById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different contribution rates', async () => {
      const rates = [0, 5, 10, 12, 15, 20];

      for (const rate of rates) {
        const pfAccount = await repository.createPFAccount({
          employee_id: testEmployeeId,
          pf_number: `PF${rate}${Date.now()}`,
          employee_contribution_rate: rate,
          employer_contribution_rate: rate,
          account_status: 'active',
        });

        expect(pfAccount.employee_contribution_rate).toBe(rate);
      }
    });

    it('should handle zero contributions', async () => {
      const pfAccount = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF333333333',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      const contribution = await repository.recordContribution(pfAccount.id, {
        month: 6,
        year: 2024,
        employee_contribution: 0,
        employer_contribution: 0,
        total_contribution: 0,
      });

      expect(contribution.total_contribution).toBe(0);
    });

    it('should handle very large contributions', async () => {
      const pfAccount = await repository.createPFAccount({
        employee_id: testEmployeeId,
        pf_number: 'PF444444444',
        employee_contribution_rate: 12,
        employer_contribution_rate: 12,
        account_status: 'active',
      });

      const contribution = await repository.recordContribution(pfAccount.id, {
        month: 6,
        year: 2024,
        employee_contribution: 999999.99,
        employer_contribution: 999999.99,
        total_contribution: 1999999.98,
      });

      expect(contribution.total_contribution).toBe(1999999.98);
    });
  });
});
