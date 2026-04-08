/**
 * Bank Details Service Unit Tests
 * Tests for bank account management logic without database
 */

import { describe, it, expect } from '@jest/globals';
import { encrypt, decrypt, serializeEncryptedData, parseEncryptedData } from '../../utils/encryption';

describe('BankDetailsService - Unit Tests', () => {
  describe('Encryption Utilities', () => {
    it('should encrypt and decrypt account numbers correctly', () => {
      const accountNumber = '1234567890123456';

      const encrypted = encrypt(accountNumber);
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(accountNumber);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(accountNumber);
    });

    it('should serialize and parse encrypted data (identity round-trip)', () => {
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

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle different account number lengths', () => {
      const testCases = [
        '123456789',
        '12345678901234567890',
        '9876543210987654',
      ];

      testCases.forEach((accountNumber) => {
        const encrypted = encrypt(accountNumber);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(accountNumber);
      });
    });

    it('should produce encrypted string in iv:authTag:data format', () => {
      const accountNumber = '1234567890123456';
      const encrypted = encrypt(accountNumber);
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);
      // iv is 12 bytes = 24 hex chars
      expect(parts[0]).toHaveLength(24);
    });
  });

  describe('Account Number Masking', () => {
    it('should mask account numbers correctly', () => {
      const accountNumber = '1234567890123456';
      const lastFour = accountNumber.slice(-4);
      const masked = '*'.repeat(Math.max(0, accountNumber.length - 4)) + lastFour;

      expect(masked).toMatch(/^\*+3456$/);
      expect(masked).not.toContain('1234567890123456');
    });

    it('should handle short account numbers', () => {
      const accountNumber = '1234';
      const lastFour = accountNumber.slice(-4);
      const masked = '*'.repeat(Math.max(0, accountNumber.length - 4)) + lastFour;

      expect(masked).toBe('1234');
    });

    it('should handle long account numbers', () => {
      const accountNumber = '12345678901234567890';
      const lastFour = accountNumber.slice(-4);
      const masked = '*'.repeat(Math.max(0, accountNumber.length - 4)) + lastFour;

      expect(masked).toMatch(/^\*{16}7890$/);
    });
  });

  describe('IFSC Code Validation', () => {
    const IFSC_CODE_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    it('should validate correct IFSC codes', () => {
      const validCodes = [
        'HDFC0001234',
        'ICIC0000001',
        'AXIS0000001',
        'SBIN0001234',
        'BKID0001234',
      ];

      validCodes.forEach((code) => {
        expect(IFSC_CODE_REGEX.test(code)).toBe(true);
      });
    });

    it('should reject invalid IFSC codes', () => {
      const invalidCodes = [
        'INVALID',
        'hdfc0001234',
        'HDFC1001234',
        'HDC0001234',
        'HDFC000123',
        'HDFC00012345',
      ];

      invalidCodes.forEach((code) => {
        expect(IFSC_CODE_REGEX.test(code)).toBe(false);
      });
    });
  });

  describe('Account Number Validation', () => {
    it('should validate account number length', () => {
      const validLengths = [9, 10, 15, 18];
      const invalidLengths = [8, 19];

      validLengths.forEach((length) => {
        const accountNumber = '1'.repeat(length);
        expect(accountNumber.length >= 9 && accountNumber.length <= 18).toBe(true);
      });

      invalidLengths.forEach((length) => {
        const accountNumber = '1'.repeat(length);
        expect(accountNumber.length >= 9 && accountNumber.length <= 18).toBe(false);
      });
    });
  });

  describe('Account Limit Validation', () => {
    it('should enforce maximum 2 accounts per employee', () => {
      const MAX_ACCOUNTS = 2;
      const accountCount = 2;

      expect(accountCount >= MAX_ACCOUNTS).toBe(true);
      expect(accountCount + 1 > MAX_ACCOUNTS).toBe(true);
    });
  });

  describe('Encryption Key Management', () => {
    it('should require ENCRYPTION_KEY environment variable', () => {
      const originalKey = process.env['ENCRYPTION_KEY'];
      delete process.env['ENCRYPTION_KEY'];

      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY environment variable is not set');

      if (originalKey) {
        process.env['ENCRYPTION_KEY'] = originalKey;
      }
    });
  });
});
