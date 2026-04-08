/**
 * Bank Account Repository - Unit Tests
 * Tests for bank account management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BankAccountRepository } from '../bankAccountRepository';
import db from '../../config/knex';
import { BankAccountDTO as CreateBankAccountDTO, UpdateBankAccountDTO } from '../../types/bankDetails';

describe('BankAccountRepository', () => {
  let repository: BankAccountRepository;
  let testEmployeeId: string;
  let testAccountId: string;

  beforeAll(async () => {
    repository = new BankAccountRepository(db);
    testEmployeeId = 'a1000000-0000-4000-a000-000000000099';

    // Clean up test data
    await db('bank_accounts').del();

    // Create test employee (FK requirement)
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-BANK-TEST-001',
        first_name: 'Bank',
        last_name: 'Test',
        email: 'bank.test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('bank_accounts').del();
    await db('employees').where('id', testEmployeeId).del();
  });

  describe('createBankAccount', () => {
    it('should create bank account', async () => {
      const data: CreateBankAccountDTO = {
        employee_id: testEmployeeId,
        account_holder_name: 'John Doe',
        account_number: '1234567890123456',
        ifsc_code: 'SBIN0001234',
        bank_name: 'State Bank of India',
        account_type: 'savings',
        is_primary: true,
      };

      const account = await repository.createBankAccount(data);

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.employee_id).toBe(testEmployeeId);
      expect(account.account_holder_name).toBe('John Doe');
      expect(account.is_primary).toBe(true);

      testAccountId = account.id;
    });

    it('should create secondary bank account', async () => {
      const data: CreateBankAccountDTO = {
        employee_id: testEmployeeId,
        account_holder_name: 'John Doe',
        account_number: '9876543210987654',
        ifsc_code: 'HDFC0001234',
        bank_name: 'HDFC Bank',
        account_type: 'current',
        is_primary: false,
      };

      const account = await repository.createBankAccount(data);

      expect(account.is_primary).toBe(false);
    });
  });

  describe('getBankAccount', () => {
    it('should retrieve bank account by ID', async () => {
      const account = await repository.getBankAccount(testAccountId);

      expect(account).toBeDefined();
      expect(account?.id).toBe(testAccountId);
    });

    it('should return null for non-existent account', async () => {
      const account = await repository.getBankAccount('00000000-0000-4000-a000-ffffffffffff');

      expect(account).toBeNull();
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account', async () => {
      const updateData: UpdateBankAccountDTO = {
        account_holder_name: 'Jonathan Doe',
      };

      const updated = await repository.updateBankAccount(testAccountId, updateData);

      expect(updated.account_holder_name).toBe('Jonathan Doe');
    });

    it('should throw error for non-existent account', async () => {
      await expect(
        repository.updateBankAccount('00000000-0000-4000-a000-ffffffffffff', { account_holder_name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getEmployeeBankAccounts', () => {
    it('should retrieve employee bank accounts', async () => {
      const accounts = await repository.getEmployeeBankAccounts(testEmployeeId);

      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
    });
  });

  describe('getPrimaryBankAccount', () => {
    it('should retrieve primary bank account', async () => {
      const account = await repository.getPrimaryBankAccount(testEmployeeId);

      expect(account).toBeDefined();
      expect(account?.is_primary).toBe(true);
    });

    it('should return null if no primary account', async () => {
      const account = await repository.getPrimaryBankAccount('00000000-0000-4000-a000-fffffffffffe');

      expect(account).toBeNull();
    });
  });

  describe('setPrimaryBankAccount', () => {
    it('should set primary bank account', async () => {
      const updated = await repository.setPrimaryBankAccount(testAccountId);

      expect(updated.is_primary).toBe(true);
    });
  });

  describe('getBankAccountCount', () => {
    it('should count bank accounts', async () => {
      const count = await repository.getBankAccountCount(testEmployeeId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('searchBankAccounts', () => {
    it('should search bank accounts by account number', async () => {
      const results = await repository.searchBankAccounts('1234567890123456');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should search by bank name', async () => {
      const results = await repository.searchBankAccounts('State Bank');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deleteBankAccount', () => {
    it('should delete bank account', async () => {
      const data: CreateBankAccountDTO = {
        employee_id: testEmployeeId,
        account_holder_name: 'Delete Test',
        account_number: '5555555555555555',
        ifsc_code: 'AXIS0001234',
        bank_name: 'Axis Bank',
        account_type: 'savings',
        is_primary: false,
      };

      const account = await repository.createBankAccount(data);
      await repository.deleteBankAccount(account.id);

      const deleted = await repository.getBankAccount(account.id);
      expect(deleted).toBeNull();
    });
  });
});
