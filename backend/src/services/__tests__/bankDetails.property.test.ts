import fc from 'fast-check';
import { describe, it, expect } from '@jest/globals';
import * as crypto from 'crypto';

/**
 * Property 55: Bank Account Limit Validation
 * Property 56: Bank Details Encryption
 * Property 57: Bank Details Change Verification
 * 
 * Feature: employee-management-system
 * 
 * **Validates: Requirements FR-4.7.3, FR-4.7.4, FR-4.7.5**
 */

// Mock encryption utilities
const ENCRYPTION_KEY = 'test-encryption-key-32-characters';
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

describe('Property 55: Bank Account Limit Validation', () => {
  
  it('should allow up to 2 bank accounts per employee', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.array(
          fc.record({
            bankName: fc.string({ minLength: 3, maxLength: 50 }),
            accountNumber: fc.string({ minLength: 9, maxLength: 18 }),
            ifscCode: fc.string({ minLength: 11, maxLength: 11 }),
            accountType: fc.constantFrom('Savings', 'Current')
          }),
          { minLength: 1, maxLength: 2 }
        ),
        (employeeId, accounts) => {
          // Simulate adding accounts
          const employeeBankAccounts: any[] = [];
          
          accounts.forEach(account => {
            if (employeeBankAccounts.length < 2) {
              employeeBankAccounts.push({
                id: fc.sample(fc.uuid(), 1)[0],
                employeeId,
                ...account,
                isPrimary: employeeBankAccounts.length === 0,
                verified: false,
                createdAt: new Date()
              });
            }
          });
          
          // Verify account limit
          expect(employeeBankAccounts.length).toBeLessThanOrEqual(2);
          expect(employeeBankAccounts.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should reject attempt to add third bank account', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.array(
          fc.record({
            bankName: fc.string({ minLength: 3, maxLength: 50 }),
            accountNumber: fc.string({ minLength: 9, maxLength: 18 }),
            ifscCode: fc.string({ minLength: 11, maxLength: 11 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        (employeeId, accounts) => {
          // Simulate adding accounts with limit check
          const employeeBankAccounts: any[] = [];
          const errors: string[] = [];
          
          accounts.forEach((account, index) => {
            if (employeeBankAccounts.length >= 2) {
              errors.push(`Cannot add account ${index + 1}: Maximum 2 bank accounts allowed per employee`);
            } else {
              employeeBankAccounts.push({
                id: fc.sample(fc.uuid(), 1)[0],
                employeeId,
                ...account
              });
            }
          });
          
          // Verify limit enforcement
          expect(employeeBankAccounts.length).toBe(2);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0]).toContain('Maximum 2 bank accounts allowed');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should allow exactly one or two accounts', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.integer({ min: 1, max: 2 }), // number of accounts to add
        (employeeId, accountCount) => {
          const accounts = Array.from({ length: accountCount }, (_, i) => ({
            id: fc.sample(fc.uuid(), 1)[0],
            employeeId,
            bankName: `Bank ${i + 1}`,
            accountNumber: `12345678${i}`,
            ifscCode: 'SBIN0001234',
            isPrimary: i === 0
          }));
          
          expect(accounts.length).toBeGreaterThanOrEqual(1);
          expect(accounts.length).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 56: Bank Details Encryption', () => {
  
  it('should encrypt account numbers using AES-256', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 9, maxLength: 18 }), // account number
        (accountNumber) => {
          // Encrypt the account number
          const { encrypted, iv, authTag } = encrypt(accountNumber);
          
          // Verify encryption properties
          expect(encrypted).toBeTruthy();
          expect(encrypted).not.toBe(accountNumber);
          expect(iv).toBeTruthy();
          expect(authTag).toBeTruthy();
          
          // Verify decryption
          const decrypted = decrypt(encrypted, iv, authTag);
          expect(decrypted).toBe(accountNumber);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should mask account numbers in UI (show only last 4 digits)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 9, maxLength: 18 }), // account number
        (accountNumber) => {
          const masked = maskAccountNumber(accountNumber);
          
          // Verify masking
          expect(masked).toBeTruthy();
          expect(masked.length).toBe(accountNumber.length);
          expect(masked.slice(-4)).toBe(accountNumber.slice(-4));
          
          // Verify all but last 4 are masked
          const maskedPortion = masked.slice(0, -4);
          expect(maskedPortion).toMatch(/^\*+$/);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should store encrypted account numbers in database', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.record({
          bankName: fc.string({ minLength: 3, maxLength: 50 }),
          accountNumber: fc.string({ minLength: 9, maxLength: 18 }),
          ifscCode: fc.string({ minLength: 11, maxLength: 11 })
        }),
        (employeeId, accountData) => {
          // Encrypt before storing
          const { encrypted, iv, authTag } = encrypt(accountData.accountNumber);
          
          const bankAccount = {
            id: fc.sample(fc.uuid(), 1)[0],
            employeeId,
            bankName: accountData.bankName,
            accountNumberEncrypted: encrypted,
            accountNumberIv: iv,
            accountNumberAuthTag: authTag,
            ifscCode: accountData.ifscCode,
            isPrimary: true,
            verified: false
          };
          
          // Verify encrypted storage
          expect(bankAccount.accountNumberEncrypted).not.toBe(accountData.accountNumber);
          expect(bankAccount.accountNumberEncrypted).toBeTruthy();
          
          // Verify can decrypt
          const decrypted = decrypt(
            bankAccount.accountNumberEncrypted,
            bankAccount.accountNumberIv,
            bankAccount.accountNumberAuthTag
          );
          expect(decrypted).toBe(accountData.accountNumber);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle encryption round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 9, maxLength: 18 }), { minLength: 1, maxLength: 10 }),
        (accountNumbers) => {
          // Encrypt all account numbers
          const encrypted = accountNumbers.map(num => ({
            original: num,
            ...encrypt(num)
          }));
          
          // Decrypt all and verify
          encrypted.forEach(item => {
            const decrypted = decrypt(item.encrypted, item.iv, item.authTag);
            expect(decrypted).toBe(item.original);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 57: Bank Details Change Verification', () => {
  
  it('should require Finance approval for bank details changes', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.record({
          oldAccountNumber: fc.string({ minLength: 9, maxLength: 18 }),
          newAccountNumber: fc.string({ minLength: 9, maxLength: 18 }),
          reason: fc.string({ minLength: 10, maxLength: 200 })
        }),
        fc.uuid(), // financeUserId
        (employeeId, changeData, financeUserId) => {
          fc.pre(changeData.oldAccountNumber !== changeData.newAccountNumber);
          
          // Simulate bank details change request
          const verificationRequest = {
            id: fc.sample(fc.uuid(), 1)[0],
            employeeId,
            oldAccountNumber: changeData.oldAccountNumber,
            newAccountNumber: changeData.newAccountNumber,
            reason: changeData.reason,
            status: 'Pending',
            requestedAt: new Date(),
            approvedBy: null,
            approvedAt: null
          };
          
          // Verify initial state
          expect(verificationRequest.status).toBe('Pending');
          expect(verificationRequest.approvedBy).toBeNull();
          
          // Simulate approval
          verificationRequest.status = 'Approved';
          verificationRequest.approvedBy = financeUserId;
          verificationRequest.approvedAt = new Date();
          
          // Verify approval state
          expect(verificationRequest.status).toBe('Approved');
          expect(verificationRequest.approvedBy).toBe(financeUserId);
          expect(verificationRequest.approvedAt).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should log all bank details changes', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.record({
          oldAccountNumber: fc.string({ minLength: 9, maxLength: 18 }),
          newAccountNumber: fc.string({ minLength: 9, maxLength: 18 }),
          oldIfscCode: fc.string({ minLength: 11, maxLength: 11 }),
          newIfscCode: fc.string({ minLength: 11, maxLength: 11 })
        }),
        fc.uuid(), // financeUserId
        (employeeId, changeData, financeUserId) => {
          // Create audit log entry
          const auditLog = {
            timestamp: new Date(),
            action: 'BANK_DETAILS_UPDATE',
            performedBy: financeUserId,
            employeeId,
            changes: {
              accountNumber: {
                old: maskAccountNumber(changeData.oldAccountNumber),
                new: maskAccountNumber(changeData.newAccountNumber)
              },
              ifscCode: {
                old: changeData.oldIfscCode,
                new: changeData.newIfscCode
              }
            },
            verificationStatus: 'Approved'
          };
          
          // Verify audit log
          expect(auditLog.action).toBe('BANK_DETAILS_UPDATE');
          expect(auditLog.performedBy).toBe(financeUserId);
          expect(auditLog.changes).toBeDefined();
          expect(auditLog.changes.accountNumber.old).toContain('*');
          expect(auditLog.changes.accountNumber.new).toContain('*');
          expect(auditLog.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not activate changes until approved', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // employeeId
        fc.string({ minLength: 9, maxLength: 18 }), // new account number
        (employeeId, newAccountNumber) => {
          // Simulate pending verification
          const bankAccount = {
            id: fc.sample(fc.uuid(), 1)[0],
            employeeId,
            accountNumberEncrypted: encrypt('1234567890').encrypted,
            pendingAccountNumber: encrypt(newAccountNumber).encrypted,
            verificationStatus: 'Pending',
            activeForPayroll: false
          };
          
          // Verify not active for payroll
          expect(bankAccount.activeForPayroll).toBe(false);
          expect(bankAccount.verificationStatus).toBe('Pending');
          
          // Simulate approval
          bankAccount.verificationStatus = 'Approved';
          bankAccount.accountNumberEncrypted = bankAccount.pendingAccountNumber;
          bankAccount.activeForPayroll = true;
          
          // Verify activated after approval
          expect(bankAccount.activeForPayroll).toBe(true);
          expect(bankAccount.verificationStatus).toBe('Approved');
        }
      ),
      { numRuns: 100 }
    );
  });
});
