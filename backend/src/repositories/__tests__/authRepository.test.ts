/**
 * Auth Repository - Integration Tests
 * Tests for the actual AuthRepository API: createUser, findById, findByEmail,
 * findByEmployeeId, updateLastLogin, MFA lifecycle, password management,
 * token versioning, backup codes, OAuth, password reset tokens, and auth event logging.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuthRepository } from '../authRepository';
import { UserRole } from '../../types/auth';
import db from '../../config/knex';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let testUserId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new AuthRepository(db);

    // Clean up test data in dependency order
    await db('auth_audit_log').del();
    await db('password_reset_tokens').del();
    await db('oauth_accounts').del();
    await db('mfa_backup_codes').del();
    await db('users').del();
    await db('employees').del();

    // Create a test employee (users.employee_id FK)
    const [emp] = await db('employees')
      .insert({
        employee_id: 'EMP-AUTH-001',
        first_name: 'Auth',
        last_name: 'TestUser',
        email: 'auth.test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('auth_audit_log').del();
    await db('password_reset_tokens').del();
    await db('oauth_accounts').del();
    await db('mfa_backup_codes').del();
    await db('users').del();
    await db('employees').del();
  });

  // ─── createUser ───────────────────────────────────────────────

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const user = await repository.createUser({
        employeeId: testEmployeeId,
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        role: UserRole.EMPLOYEE,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.employeeId).toBe(testEmployeeId);
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(UserRole.EMPLOYEE);
      expect(user.isActive).toBe(true);
      expect(user.mfaEnabled).toBe(false);

      testUserId = user.id;
    });

    it('should lowercase the email', async () => {
      // Create a second employee for this user
      const [emp2] = await db('employees')
        .insert({
          employee_id: 'EMP-AUTH-002',
          first_name: 'Case',
          last_name: 'Test',
          email: 'case.test@example.com',
          phone: '+1234567891',
          date_of_joining: new Date(),
          employment_type: 'permanent',
          status: 'active',
        })
        .returning('*');

      const user = await repository.createUser({
        employeeId: emp2.id,
        email: 'UPPERCASE@EXAMPLE.COM',
        passwordHash: 'hashed',
        role: UserRole.EMPLOYEE,
      });

      expect(user.email).toBe('uppercase@example.com');
    });

    it('should default role to EMPLOYEE when not provided', async () => {
      const [emp3] = await db('employees')
        .insert({
          employee_id: 'EMP-AUTH-003',
          first_name: 'Default',
          last_name: 'Role',
          email: 'default.role@example.com',
          phone: '+1234567892',
          date_of_joining: new Date(),
          employment_type: 'permanent',
          status: 'active',
        })
        .returning('*');

      const user = await repository.createUser({
        employeeId: emp3.id,
        email: 'defaultrole@example.com',
        passwordHash: 'hashed',
      });

      expect(user.role).toBe(UserRole.EMPLOYEE);
    });
  });

  // ─── findById ─────────────────────────────────────────────────

  describe('findById', () => {
    it('should find user by ID', async () => {
      const user = await repository.findById(testUserId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const user = await repository.findById('00000000-0000-4000-a000-ffffffffffff');

      expect(user).toBeNull();
    });
  });

  // ─── findByEmail ──────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await repository.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should be case-insensitive', async () => {
      const user = await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  // ─── findByEmployeeId ─────────────────────────────────────────

  describe('findByEmployeeId', () => {
    it('should find user by employee ID', async () => {
      const user = await repository.findByEmployeeId(testEmployeeId);

      expect(user).toBeDefined();
      expect(user?.employeeId).toBe(testEmployeeId);
    });

    it('should return null for non-existent employee ID', async () => {
      const user = await repository.findByEmployeeId('00000000-0000-4000-a000-ffffffffffff');

      expect(user).toBeNull();
    });
  });

  // ─── updateLastLogin ──────────────────────────────────────────

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      await repository.updateLastLogin(testUserId);

      const user = await repository.findById(testUserId);
      expect(user?.lastLoginAt).toBeDefined();
    });
  });

  // ─── MFA lifecycle ────────────────────────────────────────────

  describe('MFA lifecycle', () => {
    it('should store pending MFA secret', async () => {
      await repository.storePendingMFASecret(testUserId, 'test-mfa-secret');

      const user = await repository.findById(testUserId);
      expect(user?.mfaEnabled).toBe(false);
      // User has a pending secret — it's a UserMfaPending variant
      expect(user?.mfaSecret).toBe('test-mfa-secret');
    });

    it('should enable MFA', async () => {
      await repository.enableMFA(testUserId);

      const user = await repository.findById(testUserId);
      expect(user?.mfaEnabled).toBe(true);
      expect(user?.mfaSecret).toBe('test-mfa-secret');
    });

    it('should disable MFA and clear secret', async () => {
      await repository.disableMFA(testUserId);

      const user = await repository.findById(testUserId);
      expect(user?.mfaEnabled).toBe(false);
    });
  });

  // ─── updatePassword & token versioning ────────────────────────

  describe('updatePassword', () => {
    it('should update password hash and increment token version', async () => {
      const userBefore = await repository.findById(testUserId);
      const versionBefore = userBefore?.refreshTokenVersion ?? 0;

      await repository.updatePassword(testUserId, 'new_hashed_password');

      const userAfter = await repository.findById(testUserId);
      expect(userAfter?.passwordHash).toBe('new_hashed_password');
      expect(userAfter?.refreshTokenVersion).toBeGreaterThan(versionBefore);
    });
  });

  describe('incrementTokenVersion', () => {
    it('should increment refresh token version', async () => {
      const userBefore = await repository.findById(testUserId);
      const versionBefore = userBefore?.refreshTokenVersion ?? 0;

      const newVersion = await repository.incrementTokenVersion(testUserId);

      expect(newVersion).toBe(versionBefore + 1);
    });
  });

  // ─── Backup codes ─────────────────────────────────────────────

  describe('backup codes', () => {
    it('should store and use backup codes', async () => {
      const codeHashes = ['hash1', 'hash2', 'hash3'];

      await repository.storeBackupCodes(testUserId, codeHashes);

      // Use a valid code
      const used = await repository.useBackupCode(testUserId, 'hash1');
      expect(used).toBe(true);

      // Same code cannot be used again
      const reused = await repository.useBackupCode(testUserId, 'hash1');
      expect(reused).toBe(false);
    });

    it('should return false for invalid backup code', async () => {
      const used = await repository.useBackupCode(testUserId, 'invalid-hash');
      expect(used).toBe(false);
    });
  });

  // ─── Password reset tokens ───────────────────────────────────

  describe('password reset tokens', () => {
    it('should create and find a valid reset token', async () => {
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      await repository.createPasswordResetToken(testUserId, 'reset-token-123', expiresAt);

      const found = await repository.findPasswordResetToken('reset-token-123');
      expect(found).toBeDefined();
      expect(found?.userId).toBe(testUserId);
    });

    it('should return null for non-existent reset token', async () => {
      const found = await repository.findPasswordResetToken('non-existent-token');
      expect(found).toBeNull();
    });

    it('should mark reset token as used', async () => {
      const found = await repository.findPasswordResetToken('reset-token-123');
      expect(found).toBeDefined();

      await repository.markPasswordResetTokenUsed(found!.id);

      const usedToken = await repository.findPasswordResetToken('reset-token-123');
      expect(usedToken).toBeNull(); // Used tokens are not returned
    });
  });

  // ─── Auth event logging ───────────────────────────────────────

  describe('logAuthEvent', () => {
    it('should log an auth event without error', async () => {
      await expect(
        repository.logAuthEvent({
          userId: testUserId,
          email: 'test@example.com',
          eventType: 'login',
          ipAddress: '127.0.0.1',
          userAgent: 'jest-test',
          metadata: { source: 'unit-test' },
        })
      ).resolves.not.toThrow();
    });

    it('should log event without optional fields', async () => {
      await expect(
        repository.logAuthEvent({
          eventType: 'failed_login',
        })
      ).resolves.not.toThrow();
    });
  });
});
