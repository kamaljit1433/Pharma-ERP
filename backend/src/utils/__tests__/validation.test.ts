/**
 * Validation Utility Tests
 * Tests for input validation functions
 */

import {
  isValidEmail,
  isValidPhone,
  isValidUUID,
  sanitizeString,
  isValidDate,
  isValidDateString,
  validateRequired,
  validateLength,
  validateRange,
  validateEnum,
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should reject emails with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@ example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-234-567-8900')).toBe(true);
      expect(isValidPhone('+91 9876543210')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc1234567890')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    it('should accept phone numbers with various formats', () => {
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('123 456 7890')).toBe(true);
      expect(isValidPhone('+1 (123) 456-7890')).toBe(true);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
      expect(isValidUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\t\nhello\n\t')).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      expect(sanitizeString('hello    world')).toBe('hello world');
      expect(sanitizeString('hello\t\t\tworld')).toBe('hello world');
      expect(sanitizeString('hello\n\nworld')).toBe('hello world');
    });

    it('should handle mixed whitespace', () => {
      expect(sanitizeString('  hello  \t  world  \n  test  ')).toBe('hello world test');
    });

    it('should return empty string for whitespace-only input', () => {
      expect(sanitizeString('   ')).toBe('');
      expect(sanitizeString('\t\n')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('should validate valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(new Date(NaN))).toBe(false);
    });

    it('should reject non-Date objects', () => {
      expect(isValidDate('2024-01-01')).toBe(false);
      expect(isValidDate(1234567890)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('should validate valid date strings', () => {
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
      expect(isValidDateString('2024-01-01T00:00:00Z')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
      expect(isValidDateString('2024-13-01')).toBe(false);
      expect(isValidDateString('2024-01-32')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should not throw for valid values', () => {
      expect(() => validateRequired('value', 'field')).not.toThrow();
      expect(() => validateRequired(0, 'field')).not.toThrow();
      expect(() => validateRequired(false, 'field')).not.toThrow();
    });

    it('should throw for undefined', () => {
      expect(() => validateRequired(undefined, 'field')).toThrow('field is required');
    });

    it('should throw for null', () => {
      expect(() => validateRequired(null, 'field')).toThrow('field is required');
    });

    it('should throw for empty string', () => {
      expect(() => validateRequired('', 'field')).toThrow('field is required');
    });
  });

  describe('validateLength', () => {
    it('should not throw for valid length', () => {
      expect(() => validateLength('hello', 1, 10, 'field')).not.toThrow();
      expect(() => validateLength('hello', 5, 5, 'field')).not.toThrow();
    });

    it('should throw for too short string', () => {
      expect(() => validateLength('hi', 3, 10, 'field')).toThrow(
        'field must be between 3 and 10 characters'
      );
    });

    it('should throw for too long string', () => {
      expect(() => validateLength('hello world', 1, 5, 'field')).toThrow(
        'field must be between 1 and 5 characters'
      );
    });
  });

  describe('validateRange', () => {
    it('should not throw for values in range', () => {
      expect(() => validateRange(5, 1, 10, 'field')).not.toThrow();
      expect(() => validateRange(1, 1, 10, 'field')).not.toThrow();
      expect(() => validateRange(10, 1, 10, 'field')).not.toThrow();
    });

    it('should throw for values below range', () => {
      expect(() => validateRange(0, 1, 10, 'field')).toThrow(
        'field must be between 1 and 10'
      );
    });

    it('should throw for values above range', () => {
      expect(() => validateRange(11, 1, 10, 'field')).toThrow(
        'field must be between 1 and 10'
      );
    });
  });

  describe('validateEnum', () => {
    it('should not throw for valid enum values', () => {
      expect(() => validateEnum('active', ['active', 'inactive'], 'status')).not.toThrow();
      expect(() => validateEnum(1, [1, 2, 3], 'level')).not.toThrow();
    });

    it('should throw for invalid enum values', () => {
      expect(() => validateEnum('pending', ['active', 'inactive'], 'status')).toThrow(
        'status must be one of: active, inactive'
      );
    });

    it('should work with numeric enums', () => {
      expect(() => validateEnum(4, [1, 2, 3], 'level')).toThrow(
        'level must be one of: 1, 2, 3'
      );
    });
  });
});
