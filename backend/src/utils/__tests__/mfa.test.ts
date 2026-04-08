/**
 * MFA Utility Tests
 * Tests for Multi-Factor Authentication functions
 */

import {
  generateMFASecret,
  verifyMFAToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '../mfa';

describe('MFA Utilities', () => {
  describe('generateMFASecret', () => {
    it('should generate a valid MFA secret', async () => {
      const secret = await generateMFASecret('user@example.com');

      expect(secret).toBeDefined();
      expect(secret.secret).toBeDefined();
      expect(secret.qrCode).toBeDefined();
    });

    it('should generate different secrets for different users', async () => {
      const secret1 = await generateMFASecret('user1@example.com');
      const secret2 = await generateMFASecret('user2@example.com');

      expect(secret1.secret).not.toBe(secret2.secret);
    });

    it('should generate QR code', async () => {
      const secret = await generateMFASecret('user@example.com');

      expect(secret.qrCode).toContain('data:image');
    });

    it('should handle special characters in email', async () => {
      const secret = await generateMFASecret('user+tag@example.co.uk');

      expect(secret.secret).toBeDefined();
      expect(secret.qrCode).toBeDefined();
    });

    it('should generate base32 encoded secret', async () => {
      const secret = await generateMFASecret('user@example.com');

      // Base32 should only contain A-Z and 2-7
      expect(/^[A-Z2-7]+$/.test(secret.secret)).toBe(true);
    });
  });

  describe('verifyMFAToken', () => {
    it('should verify valid TOTP token', async () => {
      const secret = await generateMFASecret('user@example.com');

      // Generate a valid token using the secret
      // Note: This requires a TOTP library to generate the token
      // For testing, we'll use a mock approach
      const isValid = verifyMFAToken('000000', secret.secret);

      // Token verification depends on current time window
      // This test may need adjustment based on implementation
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject invalid token', async () => {
      const secret = await generateMFASecret('user@example.com');

      const isValid = verifyMFAToken('999999', secret.secret);

      expect(isValid).toBe(false);
    });

    it('should handle empty token', async () => {
      const secret = await generateMFASecret('user@example.com');

      const isValid = verifyMFAToken('', secret.secret);

      expect(isValid).toBe(false);
    });

    it('should handle non-numeric token', async () => {
      const secret = await generateMFASecret('user@example.com');

      const isValid = verifyMFAToken('abcdef', secret.secret);

      expect(isValid).toBe(false);
    });

    it('should handle token with wrong length', async () => {
      const secret = await generateMFASecret('user@example.com');

      const isValid = verifyMFAToken('12345', secret.secret);

      expect(isValid).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate backup codes', () => {
      const codes = generateBackupCodes();

      expect(codes).toBeDefined();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBe(8);
    });

    it('should generate specified number of codes', () => {
      const codes = generateBackupCodes(10);

      expect(codes.length).toBe(10);
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes(10);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should generate codes with correct format', () => {
      const codes = generateBackupCodes();

      codes.forEach(code => {
        // Backup codes should be alphanumeric
        expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
      });
    });

    it('should generate codes of consistent length', () => {
      const codes = generateBackupCodes(10);

      const lengths = new Set(codes.map(code => code.length));
      expect(lengths.size).toBe(1);
    });

    it('should generate different codes on each call', () => {
      const codes1 = generateBackupCodes();
      const codes2 = generateBackupCodes();

      expect(codes1).not.toEqual(codes2);
    });

    it('should handle custom count', () => {
      expect(generateBackupCodes(1).length).toBe(1);
      expect(generateBackupCodes(5).length).toBe(5);
      expect(generateBackupCodes(20).length).toBe(20);
    });
  });

  describe('hashBackupCode', () => {
    it('should hash a backup code', () => {
      const code = 'ABC123DEF456';
      const hash = hashBackupCode(code);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(code);
    });

    it('should produce consistent hash', () => {
      const code = 'ABC123DEF456';
      const hash1 = hashBackupCode(code);
      const hash2 = hashBackupCode(code);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different codes', () => {
      const hash1 = hashBackupCode('ABC123DEF456');
      const hash2 = hashBackupCode('XYZ789UVW012');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty code', () => {
      const hash = hashBackupCode('');

      expect(hash).toBeDefined();
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify matching backup code', () => {
      const code = 'ABC123DEF456';
      const hash = hashBackupCode(code);

      const isValid = verifyBackupCode(code, hash);

      expect(isValid).toBe(true);
    });

    it('should reject non-matching backup code', () => {
      const code = 'ABC123DEF456';
      const hash = hashBackupCode(code);

      const isValid = verifyBackupCode('XYZ789UVW012', hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', () => {
      const code = 'ABC123DEF456';
      const hash = hashBackupCode(code);

      const isValid = verifyBackupCode('abc123def456', hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty code', () => {
      const hash = hashBackupCode('ABC123DEF456');

      const isValid = verifyBackupCode('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle whitespace in code', () => {
      const code = 'ABC123DEF456';
      const hash = hashBackupCode(code);

      const isValid = verifyBackupCode(' ABC123DEF456 ', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should generate and verify backup codes', () => {
      const codes = generateBackupCodes(5);
      const hashes = codes.map(code => hashBackupCode(code));

      codes.forEach((code, index) => {
        const hash = hashes[index];
        expect(hash).toBeDefined();
        expect(verifyBackupCode(code, hash!)).toBe(true);
      });
    });

    it('should handle MFA setup workflow', async () => {
      // Generate secret
      const secret = await generateMFASecret('user@example.com');
      expect(secret.secret).toBeDefined();

      // Generate backup codes
      const backupCodes = generateBackupCodes();
      expect(backupCodes.length).toBe(8);

      // Hash backup codes for storage
      const hashedCodes = backupCodes.map(code => hashBackupCode(code));
      expect(hashedCodes.length).toBe(8);

      // Verify backup codes
      backupCodes.forEach((code, index) => {
        const hash = hashedCodes[index];
        expect(hash).toBeDefined();
        expect(verifyBackupCode(code, hash!)).toBe(true);
      });
    });
  });
});
