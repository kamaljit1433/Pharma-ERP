import crypto from 'crypto';
import { AuthRepository } from '../repositories/authRepository';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { generateMFASecret, verifyMFAToken, hashBackupCode } from '../utils/mfa';
import { isValidEmail } from '../utils/validation';
import {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  TokenPayload,
  MFASetup,
  OAuthProfile,
} from '../types/auth';

export class AuthService {
  private authRepo: AuthRepository;

  constructor(authRepository: AuthRepository = new AuthRepository()) {
    this.authRepo = authRepository;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.authRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingEmployee = await this.authRepo.findByEmployeeId(data.employeeId);
    if (existingEmployee) {
      throw new Error('User with this employee ID already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.authRepo.createUser({
      employeeId: data.employeeId,
      email: data.email,
      passwordHash,
      ...(data.role && { role: data.role }),
    });

    // Generate tokens
    const tokens = this.generateTokensForUser(user);

    // Log registration
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'register_success',
    });

    return { user, tokens };
  }

  /**
   * Login with email and password
   */
  async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; tokens: AuthTokens; requiresMFA: boolean }> {
    // Find user
    const user = await this.authRepo.findByEmail(data.email);
    if (!user || !user.isActive) {
      await this.authRepo.logAuthEvent({
        email: data.email,
        eventType: 'login_failed',
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
        metadata: { reason: 'invalid_credentials' },
      });
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.authRepo.logAuthEvent({
        userId: user.id,
        email: user.email,
        eventType: 'login_failed',
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
        metadata: { reason: 'invalid_password' },
      });
      throw new Error('Invalid credentials');
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      if (!data.mfaToken) {
        return {
          user,
          tokens: { accessToken: '', refreshToken: '' },
          requiresMFA: true,
        };
      }

      // Verify MFA token
      const isMFAValid = await this.verifyMFA(user, data.mfaToken);
      if (!isMFAValid) {
        await this.authRepo.logAuthEvent({
          userId: user.id,
          email: user.email,
          eventType: 'mfa_failed',
          ...(ipAddress && { ipAddress }),
          ...(userAgent && { userAgent }),
        });
        throw new Error('Invalid MFA token');
      }

      await this.authRepo.logAuthEvent({
        userId: user.id,
        email: user.email,
        eventType: 'mfa_verified',
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
      });
    }

    // Update last login
    await this.authRepo.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateTokensForUser(user);

    // Log successful login
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'login_success',
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    });

    return { user, tokens, requiresMFA: false };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }

    // Find user
    const user = await this.authRepo.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Check token version
    if (payload.tokenVersion !== user.refreshTokenVersion) {
      throw new Error('Refresh token has been revoked');
    }

    // Generate new token pair
    const tokens = this.generateTokensForUser(user);

    // Log token refresh
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'token_refresh',
    });

    return tokens;
  }

  /**
   * Logout user (invalidate all refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    await this.authRepo.incrementTokenVersion(userId);

    const user = await this.authRepo.findById(userId);
    if (user) {
      await this.authRepo.logAuthEvent({
        userId: user.id,
        email: user.email,
        eventType: 'logout',
      });
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(userId: string): Promise<MFASetup> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.mfaEnabled) {
      throw new Error('MFA is already enabled');
    }

    // Generate MFA secret and QR code
    const mfaSetup = await generateMFASecret(user.email);

    // Store the secret server-side so enableMFA can verify against it (not client-supplied)
    await this.authRepo.storePendingMFASecret(userId, mfaSetup.secret);

    // Store backup codes (hashed)
    const hashedCodes = mfaSetup.backupCodes.map(hashBackupCode);
    await this.authRepo.storeBackupCodes(userId, hashedCodes);

    return mfaSetup;
  }

  /**
   * Enable MFA after verification.
   * The secret is read from the server-side store (set during setupMFA) and never accepted from the client.
   */
  async enableMFA(userId: string, token: string): Promise<void> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Secret must have been stored by setupMFA
    if (!user.mfaSecret) {
      throw new Error('MFA setup not initiated. Call /mfa/setup first.');
    }

    // Verify token against the server-stored secret
    const isValid = verifyMFAToken(token, user.mfaSecret);
    if (!isValid) {
      throw new Error('Invalid MFA token');
    }

    // Enable MFA — secret is already stored from the setup phase
    await this.authRepo.enableMFA(userId);

    // Log MFA enabled
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'mfa_enabled',
    });
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId: string, password: string): Promise<void> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Disable MFA
    await this.authRepo.disableMFA(userId);

    // Log MFA disabled
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'mfa_disabled',
    });
  }

  /**
   * Verify MFA token or backup code.
   * TODO (Issue 10): Add per-user rate limiting on backup code attempts (e.g., max 5 failures in 15 min)
   * to prevent brute-force. Implement using a dedicated attempts table or Redis counter.
   */
  private async verifyMFA(user: User, token: string): Promise<boolean> {
    if (!user.mfaSecret) {
      return false;
    }

    // Try TOTP token first
    const isTOTPValid = verifyMFAToken(token, user.mfaSecret);
    if (isTOTPValid) {
      return true;
    }

    // Try backup code
    const codeHash = hashBackupCode(token);
    const isBackupCodeValid = await this.authRepo.useBackupCode(user.id, codeHash);
    return isBackupCodeValid;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return 'If the email exists, a reset link will be sent';
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await this.authRepo.createPasswordResetToken(user.id, resetToken, expiresAt);

    // Log password reset request
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'password_reset_requested',
    });

    return resetToken;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Find token
    const resetToken = await this.authRepo.findPasswordResetToken(token);
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await this.authRepo.updatePassword(resetToken.userId, passwordHash);

    // Mark token as used
    await this.authRepo.markPasswordResetTokenUsed(resetToken.id);

    // Log password reset
    const user = await this.authRepo.findById(resetToken.userId);
    if (user) {
      await this.authRepo.logAuthEvent({
        userId: user.id,
        email: user.email,
        eventType: 'password_reset_completed',
      });
    }
  }

  /**
   * Change password (requires current password)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await this.authRepo.updatePassword(userId, passwordHash);

    // Log password change
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'password_changed',
    });
  }

  /**
   * OAuth login/register
   */
  async oauthLogin(
    profile: OAuthProfile,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    // Check if OAuth account exists
    let user = await this.authRepo.findByOAuthAccount(profile.provider, profile.id);
    let isNewUser = false;

    if (!user) {
      // Check if user with email exists
      user = await this.authRepo.findByEmail(profile.email);

      if (!user) {
        // Create new user
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const passwordHash = await hashPassword(randomPassword);

        // Generate a unique placeholder ID; an onboarding flow must link this to a real employee record.
        const placeholderId = `OAUTH_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        user = await this.authRepo.createUser({
          employeeId: placeholderId,
          email: profile.email,
          passwordHash,
        });

        isNewUser = true;
      }

      // Link OAuth account
      await this.authRepo.upsertOAuthAccount(user.id, profile.provider, profile.id);
    }

    // Update last login
    await this.authRepo.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.generateTokensForUser(user);

    // Log OAuth login
    await this.authRepo.logAuthEvent({
      userId: user.id,
      email: user.email,
      eventType: 'oauth_login',
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: { provider: profile.provider, isNewUser },
    });

    return { user, tokens, isNewUser };
  }

  /**
   * Generate token pair for user
   */
  private generateTokensForUser(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    };

    return generateTokenPair(payload);
  }
}

export default new AuthService();
