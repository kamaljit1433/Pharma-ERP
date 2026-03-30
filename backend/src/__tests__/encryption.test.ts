/**
 * Encryption Unit Tests
 * Tests for AES-256 encryption functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  encrypt,
  decrypt,
  hash,
  generateEncryptionKey,
  maskSensitiveData,
  maskBankAccountNumber,
  isValidEncryptionKey,
  encryptObject,
  decryptObject,
  encryptArray,
  decryptArray
} from '../utils/encryption';

describe('Encryption Utilities', () => {
  beforeEach(() => {
    // Set a test encryption key
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt plaintext', () => {
      const plaintext = 'sensitive data';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'sensitive data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = '你好世界 مرحبا بالعالم';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error on invalid encrypted data', () => {
      expect(() => decrypt('invalid:data:format')).toThrow();
    });

    it('should throw error on corrupted encrypted data', () => {
      const plaintext = 'test data';
      const encrypted = encrypt(plaintext);
      const corrupted = encrypted.slice(0, -5) + 'xxxxx';

      expect(() => decrypt(corrupted)).toThrow();
    });

    it('should throw error if encryption key not set', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encrypt('test')).toThrow();
    });

    it('should throw error if encryption key is invalid length', () => {
      process.env.ENCRYPTION_KEY = 'tooshort';
      expect(() => encrypt('test')).toThrow();
    });
  });

  describe('hash', () => {
    it('should hash data consistently', () => {
      const data = 'test data';
      const hash1 = hash(data);
      const hash2 = hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-character hex string', () => {
      const result = hash('test');
      expect(result).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle empty strings', () => {
      const result = hash('');
      expect(result).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate valid encryption key', () => {
      const key = generateEncryptionKey();
      expect(isValidEncryptionKey(key)).toBe(true);
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });

    it('should generate 64-character hex string', () => {
      const key = generateEncryptionKey();
      expect(key).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data showing last N characters', () => {
      const data = '1234567890';
      const masked = maskSensitiveData(data, 4);

      expect(masked).toBe('******7890');
    });

    it('should mask entire data if shorter than N', () => {
      const data = '123';
      const masked = maskSensitiveData(data, 4);

      expect(masked).toBe('***');
    });

    it('should use default of 4 characters', () => {
      const data = '1234567890';
      const masked = maskSensitiveData(data);

      expect(masked).toBe('******7890');
    });

    it('should handle empty strings', () => {
      const masked = maskSensitiveData('', 4);
      expect(masked).toBe('');
    });

    it('should handle single character', () => {
      const masked = maskSensitiveData('a', 4);
      expect(masked).toBe('*');
    });
  });

  describe('maskBankAccountNumber', () => {
    it('should mask bank account number', () => {
      const accountNumber = '1234567890123456';
      const masked = maskBankAccountNumber(accountNumber);

      expect(masked).toBe('************3456');
    });

    it('should show only last 4 digits', () => {
      const accountNumber = '9876543210';
      const masked = maskBankAccountNumber(accountNumber);

      expect(masked).toBe('******3210');
    });
  });

  describe('isValidEncryptionKey', () => {
    it('should validate correct encryption key format', () => {
      const key = generateEncryptionKey();
      expect(isValidEncryptionKey(key)).toBe(true);
    });

    it('should reject key with wrong length', () => {
      expect(isValidEncryptionKey('tooshort')).toBe(false);
      expect(isValidEncryptionKey('a'.repeat(100))).toBe(false);
    });

    it('should reject key with non-hex characters', () => {
      expect(isValidEncryptionKey('g'.repeat(64))).toBe(false);
      expect(isValidEncryptionKey('z'.repeat(64))).toBe(false);
    });

    it('should accept uppercase hex', () => {
      const key = 'A'.repeat(64);
      expect(isValidEncryptionKey(key)).toBe(true);
    });

    it('should accept lowercase hex', () => {
      const key = 'a'.repeat(64);
      expect(isValidEncryptionKey(key)).toBe(true);
    });

    it('should accept mixed case hex', () => {
      const key = 'aAbBcCdDeEfF'.repeat(5) + 'aAbBcCdDeEfF';
      expect(isValidEncryptionKey(key)).toBe(true);
    });
  });

  describe('encryptObject', () => {
    it('should encrypt object', () => {
      const obj = { name: 'John', email: 'john@example.com' };
      const encrypted = encryptObject(obj);

      expect(encrypted).not.toContain('John');
      expect(encrypted).not.toContain('john@example.com');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          address: {
            city: 'New York'
          }
        }
      };
      const encrypted = encryptObject(obj);

      expect(encrypted).not.toContain('John');
      expect(encrypted).not.toContain('New York');
    });

    it('should handle arrays in objects', () => {
      const obj = {
        items: ['item1', 'item2', 'item3']
      };
      const encrypted = encryptObject(obj);

      expect(encrypted).not.toContain('item1');
    });
  });

  describe('decryptObject', () => {
    it('should decrypt object', () => {
      const obj = { name: 'John', email: 'john@example.com' };
      const encrypted = encryptObject(obj);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          address: {
            city: 'New York'
          }
        }
      };
      const encrypted = encryptObject(obj);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle arrays in objects', () => {
      const obj = {
        items: ['item1', 'item2', 'item3']
      };
      const encrypted = encryptObject(obj);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle null values', () => {
      const obj = { name: 'John', email: null };
      const encrypted = encryptObject(obj);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(obj);
    });
  });

  describe('encryptArray', () => {
    it('should encrypt array of values', () => {
      const values = ['value1', 'value2', 'value3'];
      const encrypted = encryptArray(values);

      expect(encrypted.length).toBe(3);
      encrypted.forEach(e => {
        expect(e).not.toMatch(/value[123]/);
      });
    });

    it('should handle empty array', () => {
      const encrypted = encryptArray([]);
      expect(encrypted).toEqual([]);
    });
  });

  describe('decryptArray', () => {
    it('should decrypt array of values', () => {
      const values = ['value1', 'value2', 'value3'];
      const encrypted = encryptArray(values);
      const decrypted = decryptArray(encrypted);

      expect(decrypted).toEqual(values);
    });

    it('should handle empty array', () => {
      const decrypted = decryptArray([]);
      expect(decrypted).toEqual([]);
    });
  });

  describe('Bank Details Encryption', () => {
    it('should encrypt bank account number', () => {
      const accountNumber = '1234567890123456';
      const encrypted = encrypt(accountNumber);

      expect(encrypted).not.toBe(accountNumber);
      expect(decrypt(encrypted)).toBe(accountNumber);
    });

    it('should encrypt IFSC code', () => {
      const ifscCode = 'SBIN0001234';
      const encrypted = encrypt(ifscCode);

      expect(decrypt(encrypted)).toBe(ifscCode);
    });

    it('should encrypt multiple bank accounts independently', () => {
      const account1 = '1111111111111111';
      const account2 = '2222222222222222';

      const encrypted1 = encrypt(account1);
      const encrypted2 = encrypt(account2);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(account1);
      expect(decrypt(encrypted2)).toBe(account2);
    });
  });

  describe('Encryption Security', () => {
    it('should use different IV for each encryption', () => {
      const plaintext = 'test data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Extract IV from encrypted data (first part before first colon)
      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];

      expect(iv1).not.toBe(iv2);
    });

    it('should use authentication tag for integrity', () => {
      const plaintext = 'test data';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');

      expect(parts.length).toBe(3); // IV:AuthTag:Ciphertext
      expect(parts[1].length).toBeGreaterThan(0); // AuthTag should exist
    });

    it('should detect tampering with ciphertext', () => {
      const plaintext = 'test data';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with ciphertext
      parts[2] = parts[2].slice(0, -2) + 'XX';
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow();
    });

    it('should detect tampering with auth tag', () => {
      const plaintext = 'test data';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with auth tag
      parts[1] = parts[1].slice(0, -2) + 'XX';
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow();
    });
  });
});
