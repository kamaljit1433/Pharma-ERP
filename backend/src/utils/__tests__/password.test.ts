/**
 * Password Utility Tests
 * Tests for password hashing and validation
 */

import { hashPassword, comparePassword, validatePasswordStrength } from '../password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(100) + 'Test123!';
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('WrongPassword123!', hash);
      expect(isMatch).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('testpassword123!', hash);
      expect(isMatch).toBe(false);
    });

    it('should handle special characters in comparison', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for empty password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const isMatch = await comparePassword('', hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');

      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('weakpass123!');

      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('uppercase');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('WEAKPASS123!');

      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('lowercase');
    });

    it('should reject password without numbers', () => {
      const result = validatePasswordStrength('WeakPass!');

      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('number');
    });

    it('should reject password without special characters', () => {
      const result = validatePasswordStrength('WeakPass123');

      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('special');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Weak1!');

      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('8 characters');
    });

    it('should accept password with all requirements', () => {
      const result = validatePasswordStrength('ValidPass123!');

      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should provide feedback for weak passwords', () => {
      const result = validatePasswordStrength('weak');

      expect(result.isStrong).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should handle very long passwords', () => {
      const longPassword = 'StrongPass123!' + 'a'.repeat(100);
      const result = validatePasswordStrength(longPassword);

      expect(result.isStrong).toBe(true);
    });

    it('should calculate score correctly', () => {
      const weak = validatePasswordStrength('weak');
      const medium = validatePasswordStrength('Medium123');
      const strong = validatePasswordStrength('StrongPass123!');

      expect(weak.score).toBeLessThan(medium.score);
      expect(medium.score).toBeLessThan(strong.score);
    });
  });
});
