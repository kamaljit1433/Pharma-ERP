import { AuthService } from '../authService';
import { AuthRepository } from '../../repositories/authRepository';
import * as jwt from '../../utils/jwt';
import * as password from '../../utils/password';
import * as mfa from '../../utils/mfa';
import * as crypto from 'crypto';

// Mock dependencies
jest.mock('../../repositories/authRepository');
jest.mock('../../utils/jwt');
jest.mock('../../utils/password');
jest.mock('../../utils/mfa');

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    authService = new AuthService(mockAuthRepository);
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        employeeId: 'EMP001',
      };

      const mockUser = {
        id: 'user-1',
        email: registerData.email,
        employeeId: registerData.employeeId,
        passwordHash: 'hashed',
        isActive: true,
        mfaEnabled: false,
        refreshTokenVersion: 1,
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockAuthRepository.findByEmployeeId as jest.Mock).mockResolvedValue(null);
      (password.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (mockAuthRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.register(registerData);

      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });

    it('should throw error for weak password', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'weak',
        employeeId: 'EMP001',
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Password too short'],
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        employeeId: 'EMP001',
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: registerData.email,
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error if employee ID already exists', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        employeeId: 'EMP001',
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockAuthRepository.findByEmployeeId as jest.Mock).mockResolvedValue({
        id: 'user-1',
        employeeId: registerData.employeeId,
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this employee ID already exists'
      );
    });

    it('should throw error for invalid email format', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        employeeId: 'EMP001',
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });

      await expect(authService.register(registerData)).rejects.toThrow(
        'Invalid email format'
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        passwordHash: 'hashed',
        isActive: true,
        mfaEnabled: false,
        refreshTokenVersion: 1,
        employeeId: 'EMP001',
        role: 'employee',
      };

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(true);
      (mockAuthRepository.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (jwt.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.login(loginData);

      expect(result.user).toEqual(mockUser);
      expect(result.requiresMFA).toBe(false);
      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        isActive: false,
      };

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should require MFA if enabled and no token provided', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        passwordHash: 'hashed',
        isActive: true,
        mfaEnabled: true,
        refreshTokenVersion: 1,
      };

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(result.requiresMFA).toBe(true);
      expect(result.tokens.accessToken).toBe('');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userId: 'user-1',
        tokenVersion: 1,
      };

      const mockUser = {
        id: 'user-1',
        isActive: true,
        refreshTokenVersion: 1,
        email: 'test@example.com',
        employeeId: 'EMP001',
        role: 'employee',
      };

      (jwt.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwt.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await authService.refreshToken(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      (jwt.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userId: 'user-1',
        tokenVersion: 1,
      };

      (jwt.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'User not found or inactive'
      );
    });

    it('should throw error if token version mismatch', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userId: 'user-1',
        tokenVersion: 1,
      };

      const mockUser = {
        id: 'user-1',
        isActive: true,
        refreshTokenVersion: 2, // Different version
      };

      (jwt.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Refresh token has been revoked'
      );
    });
  });

  describe('logout', () => {
    it('should logout user by incrementing token version', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };

      (mockAuthRepository.incrementTokenVersion as jest.Mock).mockResolvedValue(undefined);
      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await authService.logout(userId);

      expect(mockAuthRepository.incrementTokenVersion).toHaveBeenCalledWith(userId);
    });
  });

  describe('setupMFA', () => {
    it('should setup MFA for user', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        mfaEnabled: false,
      };

      const mockMFASetup = {
        secret: 'secret-key',
        qrCode: 'qr-code-data',
        backupCodes: ['code1', 'code2', 'code3'],
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (mfa.generateMFASecret as jest.Mock).mockResolvedValue(mockMFASetup);
      (mockAuthRepository.storePendingMFASecret as jest.Mock).mockResolvedValue(undefined);
      (mockAuthRepository.storeBackupCodes as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.setupMFA(userId);

      expect(result).toEqual(mockMFASetup);
      expect(mockAuthRepository.storePendingMFASecret).toHaveBeenCalled();
    });

    it('should throw error if MFA already enabled', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        mfaEnabled: true,
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.setupMFA(userId)).rejects.toThrow(
        'MFA is already enabled'
      );
    });

    it('should throw error if user not found', async () => {
      const userId = 'user-1';

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.setupMFA(userId)).rejects.toThrow('User not found');
    });
  });

  describe('enableMFA', () => {
    it('should enable MFA with valid token', async () => {
      const userId = 'user-1';
      const token = '123456';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        mfaSecret: 'secret-key',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (mfa.verifyMFAToken as jest.Mock).mockReturnValue(true);
      (mockAuthRepository.enableMFA as jest.Mock).mockResolvedValue(undefined);

      await authService.enableMFA(userId, token);

      expect(mockAuthRepository.enableMFA).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid MFA token', async () => {
      const userId = 'user-1';
      const token = 'invalid-token';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        mfaSecret: 'secret-key',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (mfa.verifyMFAToken as jest.Mock).mockReturnValue(false);

      await expect(authService.enableMFA(userId, token)).rejects.toThrow(
        'Invalid MFA token'
      );
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA with valid password', async () => {
      const userId = 'user-1';
      const currentPassword = 'SecurePass123!';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(true);
      (mockAuthRepository.disableMFA as jest.Mock).mockResolvedValue(undefined);

      await authService.disableMFA(userId, currentPassword);

      expect(mockAuthRepository.disableMFA).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid password', async () => {
      const userId = 'user-1';
      const currentPassword = 'WrongPassword';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.disableMFA(userId, currentPassword)).rejects.toThrow(
        'Invalid password'
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset for existing user', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-1',
        email,
      };

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockAuthRepository.createPasswordResetToken as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.requestPasswordReset(email);

      expect(result).toBeDefined();
      expect(mockAuthRepository.createPasswordResetToken).toHaveBeenCalled();
    });

    it('should not reveal if user exists', async () => {
      const email = 'nonexistent@example.com';

      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.requestPasswordReset(email);

      expect(result).toBe('If the email exists, a reset link will be sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'reset-token';
      const newPassword = 'NewSecurePass123!';
      const mockResetToken = {
        id: 'token-1',
        userId: 'user-1',
      };

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (mockAuthRepository.findPasswordResetToken as jest.Mock).mockResolvedValue(
        mockResetToken
      );
      (password.hashPassword as jest.Mock).mockResolvedValue('new-hash');
      (mockAuthRepository.updatePassword as jest.Mock).mockResolvedValue(undefined);
      (mockAuthRepository.markPasswordResetTokenUsed as jest.Mock).mockResolvedValue(undefined);
      (mockAuthRepository.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      await authService.resetPassword(token, newPassword);

      expect(mockAuthRepository.updatePassword).toHaveBeenCalled();
      expect(mockAuthRepository.markPasswordResetTokenUsed).toHaveBeenCalled();
    });

    it('should throw error for invalid reset token', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewSecurePass123!';

      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (mockAuthRepository.findPasswordResetToken as jest.Mock).mockResolvedValue(null);

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const userId = 'user-1';
      const currentPassword = 'OldPass123!';
      const newPassword = 'NewPass123!';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'old-hash',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(true);
      (password.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (password.hashPassword as jest.Mock).mockResolvedValue('new-hash');
      (mockAuthRepository.updatePassword as jest.Mock).mockResolvedValue(undefined);

      await authService.changePassword(userId, currentPassword, newPassword);

      expect(mockAuthRepository.updatePassword).toHaveBeenCalledWith(userId, 'new-hash');
    });

    it('should throw error for incorrect current password', async () => {
      const userId = 'user-1';
      const currentPassword = 'WrongPassword';
      const newPassword = 'NewPass123!';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'old-hash',
      };

      (mockAuthRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (password.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('oauthLogin', () => {
    it('should login existing OAuth user', async () => {
      const profile = {
        provider: 'google' as const,
        id: 'google-123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const mockUser = {
        id: 'user-1',
        email: profile.email,
        employeeId: 'EMP001',
        role: 'employee',
        refreshTokenVersion: 1,
      };

      (mockAuthRepository.findByOAuthAccount as jest.Mock).mockResolvedValue(mockUser);
      (mockAuthRepository.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (jwt.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.oauthLogin(profile);

      expect(result.user).toEqual(mockUser);
      expect(result.isNewUser).toBe(false);
    });

    it('should create new user for new OAuth account', async () => {
      const profile = {
        provider: 'google' as const,
        id: 'google-123',
        email: 'newuser@example.com',
        displayName: 'New User',
      };

      const mockUser = {
        id: 'user-1',
        email: profile.email,
        employeeId: expect.stringContaining('OAUTH_'),
        role: 'employee',
        refreshTokenVersion: 1,
      };

      (mockAuthRepository.findByOAuthAccount as jest.Mock).mockResolvedValue(null);
      (mockAuthRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (password.hashPassword as jest.Mock).mockResolvedValue('random-hash');
      (mockAuthRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (mockAuthRepository.upsertOAuthAccount as jest.Mock).mockResolvedValue(undefined);
      (mockAuthRepository.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (jwt.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.oauthLogin(profile);

      expect(result.isNewUser).toBe(true);
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });
  });
});
