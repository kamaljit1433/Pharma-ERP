/**
 * Bank Details Service Tests
 * Unit tests for bank account management with encryption
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from '../../config/knex';
import BankDetailsService from '../bankDetailsService';
import BankAccountRepository from '../../repositories/bankAccountRepository';
import { encrypt, decrypt, serializeEncryptedData, parseEncryptedData } from '../../utils/encryption';

describe('BankDetailsService', () => {
  let db: Knex;
  let employeeId: string;
  let performedBy: string;

  beforeEach(async () => {
    db = knex;
    
    // Create test employee
    const [employee] = await db('employees').insert({
      first_name: 'Test',
      last_name: 'Employee',
      email: `test-${Date.now()}@example.com`,
      phone: '9876543210',
      date_of_birth: '1990-01-01',
      gender: 'M',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    employeeId = employee.id;
    performedBy = employee.id;
  });

  afterEach(async () => {
    // Clean up
    await db('bank_account_audit_logs').where('employee_id', employeeId).delete();
    await db('bank_accounts').where('employee_id', employeeId).delete();
    await db('employees').where('id', employeeId).delete();
  });

  describe('addBankAccount', () => {
    it('should create a new bank account with encrypted account number', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      expect(result).toBeDefined();
      expect(result.account_holder_name).toBe('John Doe');
      expect(result.bank_name).toBe('HDFC Bank');
      expect(result.account_number_masked).toMatch(/^\*+1234$/);
      expect(result.ifsc_code).toBe('HDFC0001234');
      expect(result.account_type).toBe('savings');
      expect(result.is_primary).toBe(false);
      expect(result.verification_status).toBe('pending');
    });

    it('should reject account number with invalid length', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '123',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      await expect(BankDetailsService.addBankAccount(employeeId, data, performedBy)).rejects.toThrow(
        'Invalid account number'
      );
    });

    it('should reject invalid IFSC code format', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'INVALID',
        account_type: 'savings' as const,
      };

      await expect(BankDetailsService.addBankAccount(employeeId, data, performedBy)).rejects.toThrow(
        'Invalid IFSC code format'
      );
    });

    it('should enforce maximum 2 accounts per employee', async () => {
      const data1 = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const data2 = {
        account_holder_name: 'John Doe',
        bank_name: 'ICICI Bank',
        account_number: '9876543210987654',
        ifsc_code: 'ICIC0000001',
        account_type: 'current' as const,
      };

      const data3 = {
        account_holder_name: 'John Doe',
        bank_name: 'Axis Bank',
        account_number: '5555555555555555',
        ifsc_code: 'AXIS0000001',
        account_type: 'salary' as const,
      };

      // Add first account
      await BankDetailsService.addBankAccount(employeeId, data1, performedBy);

      // Add second account
      await BankDetailsService.addBankAccount(employeeId, data2, performedBy);

      // Try to add third account - should fail
      await expect(BankDetailsService.addBankAccount(employeeId, data3, performedBy)).rejects.toThrow(
        'Maximum 2 bank accounts allowed per employee'
      );
    });

    it('should reject empty account holder name', async () => {
      const data = {
        account_holder_name: '',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      await expect(BankDetailsService.addBankAccount(employeeId, data, performedBy)).rejects.toThrow(
        'Account holder name is required'
      );
    });

    it('should reject empty bank name', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: '',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      await expect(BankDetailsService.addBankAccount(employeeId, data, performedBy)).rejects.toThrow(
        'Bank name is required'
      );
    });
  });

  describe('updateBankAccount', () => {
    let accountId: string;

    beforeEach(async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);
      accountId = result.id;
    });

    it('should update bank account details', async () => {
      const updateData = {
        account_holder_name: 'Jane Doe',
        bank_name: 'ICICI Bank',
      };

      const result = await BankDetailsService.updateBankAccount(accountId, employeeId, updateData, performedBy);

      expect(result.account_holder_name).toBe('Jane Doe');
      expect(result.bank_name).toBe('ICICI Bank');
    });

    it('should reject invalid IFSC code on update', async () => {
      const updateData = {
        ifsc_code: 'INVALID',
      };

      await expect(
        BankDetailsService.updateBankAccount(accountId, employeeId, updateData, performedBy)
      ).rejects.toThrow('Invalid IFSC code format');
    });

    it('should reject non-existent account', async () => {
      const updateData = {
        account_holder_name: 'Jane Doe',
      };

      await expect(
        BankDetailsService.updateBankAccount('non-existent-id', employeeId, updateData, performedBy)
      ).rejects.toThrow('Bank account not found');
    });

    it('should reject update from unauthorized employee', async () => {
      const [otherEmployee] = await db('employees').insert({
        id: db.raw('gen_random_uuid()'),
        first_name: 'Other',
        last_name: 'Employee',
        email: `other-${Date.now()}@example.com`,
        phone: '9876543211',
        date_of_birth: '1990-01-01',
        gender: 'M',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      const updateData = {
        account_holder_name: 'Jane Doe',
      };

      await expect(
        BankDetailsService.updateBankAccount(accountId, otherEmployee.id, updateData, performedBy)
      ).rejects.toThrow('Unauthorized');

      // Clean up
      await db('employees').where('id', otherEmployee.id).delete();
    });
  });

  describe('setPrimaryAccount', () => {
    let account1Id: string;
    let account2Id: string;

    beforeEach(async () => {
      const data1 = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const data2 = {
        account_holder_name: 'John Doe',
        bank_name: 'ICICI Bank',
        account_number: '9876543210987654',
        ifsc_code: 'ICIC0000001',
        account_type: 'current' as const,
      };

      const result1 = await BankDetailsService.addBankAccount(employeeId, data1, performedBy);
      account1Id = result1.id;

      const result2 = await BankDetailsService.addBankAccount(employeeId, data2, performedBy);
      account2Id = result2.id;

      // Verify both accounts
      await BankAccountRepository.verify(account1Id, employeeId, performedBy);
      await BankAccountRepository.verify(account2Id, employeeId, performedBy);
    });

    it('should set account as primary', async () => {
      const result = await BankDetailsService.setPrimaryAccount(account1Id, employeeId, performedBy);

      expect(result.is_primary).toBe(true);
    });

    it('should only allow one primary account', async () => {
      // Set first account as primary
      await BankDetailsService.setPrimaryAccount(account1Id, employeeId, performedBy);

      // Set second account as primary
      await BankDetailsService.setPrimaryAccount(account2Id, employeeId, performedBy);

      // Verify only second is primary
      const accounts = await BankDetailsService.getBankAccounts(employeeId);
      const primaryAccounts = accounts.filter((a) => a.is_primary);

      expect(primaryAccounts).toHaveLength(1);
      expect(primaryAccounts[0]?.id).toBe(account2Id);
    });

    it('should reject setting unverified account as primary', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'Axis Bank',
        account_number: '5555555555555555',
        ifsc_code: 'AXIS0000001',
        account_type: 'salary' as const,
      };

      // Delete one account to make room
      await BankDetailsService.deleteBankAccount(account2Id, employeeId, performedBy);

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      await expect(
        BankDetailsService.setPrimaryAccount(result.id, employeeId, performedBy)
      ).rejects.toThrow('Only verified accounts can be set as primary');
    });
  });

  describe('getBankAccounts', () => {
    it('should return all bank accounts for employee', async () => {
      const data1 = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const data2 = {
        account_holder_name: 'John Doe',
        bank_name: 'ICICI Bank',
        account_number: '9876543210987654',
        ifsc_code: 'ICIC0000001',
        account_type: 'current' as const,
      };

      await BankDetailsService.addBankAccount(employeeId, data1, performedBy);
      await BankDetailsService.addBankAccount(employeeId, data2, performedBy);

      const accounts = await BankDetailsService.getBankAccounts(employeeId);

      expect(accounts).toHaveLength(2);
      expect(accounts[0]?.account_holder_name).toBe('John Doe');
      expect(accounts[1]?.account_holder_name).toBe('John Doe');
    });

    it('should mask account numbers in response', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      const accounts = await BankDetailsService.getBankAccounts(employeeId);

      expect(accounts[0]?.account_number_masked).toMatch(/^\*+1234$/);
      expect(accounts[0]?.account_number_masked).not.toContain('1234567890123456');
    });
  });

  describe('getPrimaryAccount', () => {
    it('should return primary account', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      // Verify and set as primary
      await BankAccountRepository.verify(result.id, employeeId, performedBy);
      await BankDetailsService.setPrimaryAccount(result.id, employeeId, performedBy);

      const primary = await BankDetailsService.getPrimaryAccount(employeeId);

      expect(primary).toBeDefined();
      expect(primary?.is_primary).toBe(true);
      expect(primary?.id).toBe(result.id);
    });

    it('should return null if no primary account', async () => {
      const primary = await BankDetailsService.getPrimaryAccount(employeeId);

      expect(primary).toBeNull();
    });
  });

  describe('verifyBankAccount', () => {
    let accountId: string;

    beforeEach(async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);
      accountId = result.id;
    });

    it('should verify bank account', async () => {
      const result = await BankDetailsService.verifyBankAccount(accountId, performedBy);

      expect(result.verification_status).toBe('verified');
      expect(result.verified_by).toBe(performedBy);
      expect(result.verified_at).toBeDefined();
    });
  });

  describe('deleteBankAccount', () => {
    let accountId: string;

    beforeEach(async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);
      accountId = result.id;
    });

    it('should delete bank account', async () => {
      await BankDetailsService.deleteBankAccount(accountId, employeeId, performedBy);

      const accounts = await BankDetailsService.getBankAccounts(employeeId);

      expect(accounts).toHaveLength(0);
    });

    it('should prevent deletion of primary account', async () => {
      // Verify and set as primary
      await BankAccountRepository.verify(accountId, employeeId, performedBy);
      await BankDetailsService.setPrimaryAccount(accountId, employeeId, performedBy);

      await expect(BankDetailsService.deleteBankAccount(accountId, employeeId, performedBy)).rejects.toThrow(
        'Cannot delete primary bank account'
      );
    });
  });

  describe('Encryption', () => {
    it('should encrypt and decrypt account numbers correctly', () => {
      const accountNumber = '1234567890123456';

      const encrypted = encrypt(accountNumber);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(accountNumber);
    });

    it('should serialize and parse encrypted data', () => {
      const accountNumber = '1234567890123456';

      const encrypted = encrypt(accountNumber);
      const serialized = serializeEncryptedData(encrypted);
      const parsed = parseEncryptedData(serialized);

      const decrypted = decrypt(parsed);
      expect(decrypted).toBe(accountNumber);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const accountNumber = '1234567890123456';

      const encrypted1 = encrypt(accountNumber);
      const encrypted2 = encrypt(accountNumber);

      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe('Audit Logging', () => {
    it('should log account creation', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      const logs = await BankAccountRepository.getAuditLogs(result.id);

      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('create');
      expect(logs[0]?.performed_by).toBe(performedBy);
    });

    it('should log account updates', async () => {
      const data = {
        account_holder_name: 'John Doe',
        bank_name: 'HDFC Bank',
        account_number: '1234567890123456',
        ifsc_code: 'HDFC0001234',
        account_type: 'savings' as const,
      };

      const result = await BankDetailsService.addBankAccount(employeeId, data, performedBy);

      const updateData = {
        account_holder_name: 'Jane Doe',
      };

      await BankDetailsService.updateBankAccount(result.id, employeeId, updateData, performedBy);

      const logs = await BankAccountRepository.getAuditLogs(result.id);

      expect(logs).toHaveLength(2);
      expect(logs[0]?.action).toBe('update');
    });
  });
});
