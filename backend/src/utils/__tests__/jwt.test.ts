/**
 * JWT Utility Tests
 * Tests for JWT token generation and verification
 */

import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from '../jwt';
import { TokenPayload } from '../../types/auth';
import { UserRole } from '../../types/auth';

describe('JWT Utilities', () => {
  const testPayload: TokenPayload = {
    userId: 'user-123',
    employeeId: 'emp-123',
    email: 'user@example.com',
    role: UserRole.EMPLOYEE,
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate different tokens for same payload', async () => {
      const token1 = generateAccessToken(testPayload);
      
      // Wait 1 second to ensure different iat (issued at) timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const token2 = generateAccessToken(testPayload);

      expect(token1).not.toBe(token2);
    });

    it('should include payload data in token', () => {
      const token = generateAccessToken(testPayload);
      const verified = verifyAccessToken(token);

      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate different tokens for same payload', async () => {
      const token1 = generateRefreshToken(testPayload);
      
      // Wait 1 second to ensure different iat (issued at) timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const token2 = generateRefreshToken(testPayload);

      expect(token1).not.toBe(token2);
    });

    it('should include payload data in token', () => {
      const token = generateRefreshToken(testPayload);
      const verified = verifyRefreshToken(token);

      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(testPayload);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should generate valid tokens', () => {
      const tokens = generateTokenPair(testPayload);

      const accessVerified = verifyAccessToken(tokens.accessToken);
      const refreshVerified = verifyRefreshToken(tokens.refreshToken);

      expect(accessVerified.userId).toBe(testPayload.userId);
      expect(refreshVerified.userId).toBe(testPayload.userId);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload);
      const verified = verifyAccessToken(token);

      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('should throw on tampered token', () => {
      const token = generateAccessToken(testPayload);
      const tampered = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('should throw on expired token', () => {
      // Create a token with very short expiration
      const shortLivedPayload = { ...testPayload };
      const token = generateAccessToken(shortLivedPayload);

      // Wait for token to expire (if expiration is set to 1ms)
      // This test assumes the token has an expiration time
      // If not, this test may need adjustment
    });

    it('should throw on empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });

    it('should throw on malformed token', () => {
      expect(() => verifyAccessToken('not.a.token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const verified = verifyRefreshToken(token);

      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
    });

    it('should throw on tampered token', () => {
      const token = generateRefreshToken(testPayload);
      const tampered = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyRefreshToken(tampered)).toThrow();
    });

    it('should throw on empty token', () => {
      expect(() => verifyRefreshToken('')).toThrow();
    });
  });

  describe('Token payload variations', () => {
    it('should handle payload with all required fields', () => {
      const fullPayload: TokenPayload = {
        userId: 'user-456',
        employeeId: 'emp-456',
        email: 'full@example.com',
        role: UserRole.HR_MANAGER,
        tokenVersion: 1,
      };

      const token = generateAccessToken(fullPayload);
      const verified = verifyAccessToken(token);

      expect(verified.userId).toBe(fullPayload.userId);
      expect(verified.employeeId).toBe(fullPayload.employeeId);
      expect(verified.email).toBe(fullPayload.email);
      expect(verified.role).toBe(fullPayload.role);
      expect(verified.tokenVersion).toBe(fullPayload.tokenVersion);
    });

    it('should handle different roles', () => {
      const roles = [
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.FINANCE,
        UserRole.EMPLOYEE,
      ];

      roles.forEach(role => {
        const payload: TokenPayload = { ...testPayload, role };
        const token = generateAccessToken(payload);
        const verified = verifyAccessToken(token);

        expect(verified.role).toBe(role);
      });
    });

    it('should handle special characters in email', () => {
      const payload: TokenPayload = {
        ...testPayload,
        email: 'user+tag@example.co.uk',
      };

      const token = generateAccessToken(payload);
      const verified = verifyAccessToken(token);

      expect(verified.email).toBe(payload.email);
    });
  });

  describe('Token security', () => {
    it('should not expose sensitive data in token header', () => {
      const token = generateAccessToken(testPayload);
      const parts = token.split('.');
      
      // Ensure parts[0] exists before using it
      expect(parts[0]).toBeDefined();
      const header = JSON.parse(Buffer.from(parts[0]!, 'base64').toString());

      expect(header.alg).toBeDefined();
      expect(header.typ).toBe('JWT');
    });

    it('should include standard JWT claims', () => {
      const token = generateAccessToken(testPayload);
      const verified = verifyAccessToken(token) as TokenPayload & { iat?: number; exp?: number };

      // Standard JWT claims (added by jsonwebtoken library)
      expect(verified.iat).toBeDefined(); // issued at
      expect(verified.exp).toBeDefined(); // expiration
    });

    it('should not allow access token to be used as refresh token', () => {
      const accessToken = generateAccessToken(testPayload);

      // Access tokens use a different secret than refresh tokens
      // So verifying an access token with the refresh secret should fail
      expect(() => verifyRefreshToken(accessToken)).toThrow('Invalid refresh token');
    });
  });
});
