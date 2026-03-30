/**
 * Bank Details Service
 * Manages bank account operations with encryption and verification workflow
 */

import { BankAccount, BankAccountDTO, UpdateBankAccountDTO, BankAccountMasked } from '../types/bankDetails';
import BankAccountRepository from '../repositories/bankAccountRepository';

const MAX_ACCOUNTS_PER_EMPLOYEE = 2;
const IFSC_CODE_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export class BankDetailsService {
  /**
   * Add a new bank account for an employee
   */
  async addBankAccount(employeeId: string, data: BankAccountDTO, performedBy: string): Promise<BankAccountMasked> {
    // Validate account limit
    const accountCount = await BankAccountRepository.countByEmployeeId(employeeId);
    if (accountCount >= MAX_ACCOUNTS_PER_EMPLOYEE) {
      throw new Error(`Maximum ${MAX_ACCOUNTS_PER_EMPLOYEE} bank accounts allowed per employee`);
    }

    // Validate IFSC code format
    if (!IFSC_CODE_REGEX.test(data.ifsc_code)) {
      throw new Error('Invalid IFSC code format. Expected format: ABCD0123456');
    }

    // Validate account number (basic validation)
    if (!data.account_number || data.account_number.length < 9 || data.account_number.length > 18) {
      throw new Error('Invalid account number. Must be between 9 and 18 digits');
    }

    // Validate account holder name
    if (!data.account_holder_name || data.account_holder_name.trim().length === 0) {
      throw new Error('Account holder name is required');
    }

    // Validate bank name
    if (!data.bank_name || data.bank_name.trim().length === 0) {
      throw new Error('Bank name is required');
    }

    const account = await BankAccountRepository.create(employeeId, data, performedBy);
    return this.maskAccountNumber(account);
  }

  /**
   * Update an existing bank account
   */
  async updateBankAccount(
    accountId: string,
    employeeId: string,
    data: UpdateBankAccountDTO,
    performedBy: string
  ): Promise<BankAccountMasked> {
    // Verify account exists and belongs to employee
    const account = await BankAccountRepository.getById(accountId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (account.employee_id !== employeeId) {
      throw new Error('Unauthorized: Account does not belong to this employee');
    }

    // Validate IFSC code if provided
    if (data.ifsc_code && !IFSC_CODE_REGEX.test(data.ifsc_code)) {
      throw new Error('Invalid IFSC code format. Expected format: ABCD0123456');
    }

    // Validate account number if provided
    if (data.account_number) {
      if (data.account_number.length < 9 || data.account_number.length > 18) {
        throw new Error('Invalid account number. Must be between 9 and 18 digits');
      }
    }

    // Validate account holder name if provided
    if (data.account_holder_name && data.account_holder_name.trim().length === 0) {
      throw new Error('Account holder name cannot be empty');
    }

    // Validate bank name if provided
    if (data.bank_name && data.bank_name.trim().length === 0) {
      throw new Error('Bank name cannot be empty');
    }

    const updated = await BankAccountRepository.update(accountId, employeeId, data, performedBy);
    return this.maskAccountNumber(updated);
  }

  /**
   * Set a bank account as primary (only one primary per employee)
   */
  async setPrimaryAccount(accountId: string, employeeId: string, performedBy: string): Promise<BankAccountMasked> {
    // Verify account exists and belongs to employee
    const account = await BankAccountRepository.getById(accountId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (account.employee_id !== employeeId) {
      throw new Error('Unauthorized: Account does not belong to this employee');
    }

    // Verify account is verified before setting as primary
    if (account.verification_status !== 'verified') {
      throw new Error('Only verified accounts can be set as primary');
    }

    const updated = await BankAccountRepository.setPrimary(accountId, employeeId, performedBy);
    return this.maskAccountNumber(updated);
  }

  /**
   * Get all bank accounts for an employee (masked)
   */
  async getBankAccounts(employeeId: string): Promise<BankAccountMasked[]> {
    const accounts = await BankAccountRepository.getByEmployeeId(employeeId);
    return accounts.map((account) => this.maskAccountNumber(account));
  }

  /**
   * Get primary bank account for an employee (masked)
   */
  async getPrimaryAccount(employeeId: string): Promise<BankAccountMasked | null> {
    const account = await BankAccountRepository.getPrimaryAccount(employeeId);
    if (!account) {
      return null;
    }
    return this.maskAccountNumber(account);
  }

  /**
   * Verify a bank account (Finance/Admin only)
   */
  async verifyBankAccount(accountId: string, verifiedBy: string): Promise<BankAccountMasked> {
    const account = await BankAccountRepository.getById(accountId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    const verified = await BankAccountRepository.verify(accountId, account.employee_id, verifiedBy);
    return this.maskAccountNumber(verified);
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(accountId: string, employeeId: string, performedBy: string): Promise<void> {
    // Verify account exists and belongs to employee
    const account = await BankAccountRepository.getById(accountId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (account.employee_id !== employeeId) {
      throw new Error('Unauthorized: Account does not belong to this employee');
    }

    // Prevent deletion of primary account
    if (account.is_primary) {
      throw new Error('Cannot delete primary bank account. Set another account as primary first.');
    }

    await BankAccountRepository.delete(accountId, employeeId, performedBy);
  }

  /**
   * Mask account number to show only last 4 digits
   */
  private maskAccountNumber(account: BankAccount): BankAccountMasked {
    const accountNumber = account.account_number_encrypted;
    const lastFour = accountNumber.slice(-4);
    const masked = '*'.repeat(Math.max(0, accountNumber.length - 4)) + lastFour;

    const { account_number_encrypted, ...rest } = account;
    return {
      ...rest,
      account_number_masked: masked,
    } as BankAccountMasked;
  }
}

export default new BankDetailsService();
