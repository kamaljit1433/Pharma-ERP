/**
 * Encryption Utility Tests
 * Tests for encryption, decryption, and hashing functions
 */

import { encrypt, decrypt, hash, generateEncryptionKey } from '../encryption';

describe('Encryption Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt plaintext', () => {
      const plaintext = 'sensitive data';
      const encrypted = encrypt(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
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

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'sensitive data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Due to IV/nonce, ciphertexts should be different
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same plaintext
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should throw on invalid encrypted data', () => {
      expect(() => decrypt('invalid-encrypted-data')).toThrow();
    });

    it('should throw on corrupted encrypted data', () => {
      const plaintext = 'test data';
      const encrypted = encrypt(plaintext);
      const corrupted = encrypted.slice(0, -5) + 'xxxxx';

      expect(() => decrypt(corrupted)).toThrow();
    });
  });

  describe('hash', () => {
    it('should hash a string', () => {
      const data = 'test data';
      const hashed = hash(data);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce consistent hash for same input', () => {
      const data = 'test data';
      const hash1 = hash(data);
      const hash2 = hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hashed = hash('');

      expect(hashed).toBeDefined();
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashed = hash(data);

      expect(hashed).toBeDefined();
    });

    it('should handle unicode characters', () => {
      const data = '你好世界 مرحبا بالعالم';
      const hashed = hash(data);

      expect(hashed).toBeDefined();
    });

    it('should handle long strings', () => {
      const data = 'a'.repeat(10000);
      const hashed = hash(data);

      expect(hashed).toBeDefined();
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should be deterministic', () => {
      const data = 'test data';
      const hashes = [hash(data), hash(data), hash(data)];

      expect(new Set(hashes).size).toBe(1);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a key', () => {
      const key = generateEncryptionKey();

      expect(key).toBeDefined();
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate different keys', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });

    it('should generate valid base64 string', () => {
      const key = generateEncryptionKey();

      // Should be valid base64
      expect(() => Buffer.from(key, 'base64')).not.toThrow();
    });

    it('should generate keys of consistent length', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const key3 = generateEncryptionKey();

      expect(key1.length).toBe(key2.length);
      expect(key2.length).toBe(key3.length);
    });
  });

  describe('Integration tests', () => {
    it('should handle bank account encryption', () => {
      const bankAccount = '1234567890123456';
      const encrypted = encrypt(bankAccount);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(bankAccount);
    });

    it('should handle PII encryption', () => {
      const pii = 'John Doe, SSN: 123-45-6789';
      const encrypted = encrypt(pii);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(pii);
    });

    it('should handle JSON encryption', () => {
      const data = JSON.stringify({ name: 'John', email: 'john@example.com' });
      const encrypted = encrypt(data);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed.name).toBe('John');
      expect(parsed.email).toBe('john@example.com');
    });
  });
});
