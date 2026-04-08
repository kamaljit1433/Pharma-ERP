import { Knex } from 'knex';
import knex from '../config/knex';
import { User, UserRole } from '../types/auth';

export class AuthRepository {
  private db: Knex;

  constructor(database: Knex = knex) {
    this.db = database;
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    employeeId: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    const [user] = await this.db('users')
      .insert({
        employee_id: data.employeeId,
        email: data.email.toLowerCase(),
        password_hash: data.passwordHash,
        role: data.role || UserRole.EMPLOYEE,
      })
      .returning('*');

    return this.mapToUser(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.db('users').where({ id }).first();
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db('users')
      .where({ email: email.toLowerCase() })
      .first();
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Find user by employee ID
   */
  async findByEmployeeId(employeeId: string): Promise<User | null> {
    const user = await this.db('users')
      .where({ employee_id: employeeId })
      .first();
    return user ? this.mapToUser(user) : null;
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.db('users')
      .where({ id: userId })
      .update({
        last_login_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      });
  }

  /**
   * Store a pending MFA secret during the setup phase (before the user confirms with a token).
   * mfa_enabled remains false until enableMFA() is called.
   */
  async storePendingMFASecret(userId: string, secret: string): Promise<void> {
    await this.db('users')
      .where({ id: userId })
      .update({ mfa_secret: secret, updated_at: this.db.fn.now() });
  }

  /**
   * Enable MFA for user. Secret must already be stored via storePendingMFASecret().
   */
  async enableMFA(userId: string): Promise<void> {
    await this.db('users')
      .where({ id: userId })
      .update({
        mfa_enabled: true,
        updated_at: this.db.fn.now(),
      });
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<void> {
    await this.db('users')
      .where({ id: userId })
      .update({
        mfa_enabled: false,
        mfa_secret: null,
        updated_at: this.db.fn.now(),
      });

    // Delete all backup codes
    await this.db('mfa_backup_codes').where({ user_id: userId }).delete();
  }

  /**
   * Increment refresh token version (invalidates all existing refresh tokens)
   */
  async incrementTokenVersion(userId: string): Promise<number> {
    const [user] = await this.db('users')
      .where({ id: userId })
      .increment('refresh_token_version', 1)
      .returning('refresh_token_version');

    return user.refresh_token_version;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db('users')
      .where({ id: userId })
      .update({
        password_hash: passwordHash,
        updated_at: this.db.fn.now(),
      });

    // Invalidate all refresh tokens
    await this.incrementTokenVersion(userId);
  }

  /**
   * Store MFA backup codes
   */
  async storeBackupCodes(userId: string, codeHashes: string[]): Promise<void> {
    const codes = codeHashes.map((hash) => ({
      user_id: userId,
      code_hash: hash,
    }));

    await this.db('mfa_backup_codes').insert(codes);
  }

  /**
   * Atomically verify and mark a backup code as used.
   * A single UPDATE...RETURNING prevents the race condition where two simultaneous
   * requests could both read used=false and both succeed.
   */
  async useBackupCode(userId: string, codeHash: string): Promise<boolean> {
    const updated = await this.db('mfa_backup_codes')
      .where({ user_id: userId, code_hash: codeHash, used: false })
      .update({ used: true, used_at: this.db.fn.now() })
      .returning('id');

    return updated.length > 0;
  }

  /**
   * Create or update OAuth account
   */
  async upsertOAuthAccount(
    userId: string,
    provider: 'google' | 'microsoft',
    providerAccountId: string,
    accessToken?: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<void> {
    const existing = await this.db('oauth_accounts')
      .where({ provider, provider_account_id: providerAccountId })
      .first();

    if (existing) {
      await this.db('oauth_accounts')
        .where({ id: existing.id })
        .update({
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt,
          updated_at: this.db.fn.now(),
        });
    } else {
      await this.db('oauth_accounts').insert({
        user_id: userId,
        provider,
        provider_account_id: providerAccountId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
      });
    }
  }

  /**
   * Find user by OAuth account
   */
  async findByOAuthAccount(
    provider: 'google' | 'microsoft',
    providerAccountId: string
  ): Promise<User | null> {
    const account = await this.db('oauth_accounts')
      .where({ provider, provider_account_id: providerAccountId })
      .first();

    if (!account) {
      return null;
    }

    return this.findById(account.user_id);
  }

  /**
   * Create password reset token
   */
  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await this.db('password_reset_tokens').insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  }

  /**
   * Find valid password reset token
   */
  async findPasswordResetToken(token: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
  } | null> {
    const resetToken = await this.db('password_reset_tokens')
      .where({
        token,
        used: false,
      })
      .where('expires_at', '>', this.db.fn.now())
      .first();

    if (!resetToken) {
      return null;
    }

    return {
      id: resetToken.id,
      userId: resetToken.user_id,
      expiresAt: resetToken.expires_at,
    };
  }

  /**
   * Mark password reset token as used
   */
  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await this.db('password_reset_tokens')
      .where({ id: tokenId })
      .update({
        used: true,
        used_at: this.db.fn.now(),
      });
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(data: {
    userId?: string;
    email?: string;
    eventType: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const eventTypeMap: Record<string, string> = {
      login: 'login_success',
      failed_login: 'login_failed',
    };
    const event_type = eventTypeMap[data.eventType] ?? data.eventType;

    await this.db('auth_audit_log').insert({
      user_id: data.userId,
      email: data.email?.toLowerCase() ?? '',
      event_type,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    });
  }

  /**
   * Map database row to User object
   */
  private mapToUser(row: {
    id: string;
    employee_id: string;
    email: string;
    password_hash: string;
    role: string;
    mfa_enabled: boolean;
    mfa_secret: string | null;
    refresh_token_version: number;
    is_active: boolean;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): User {
    const base = {
      id: row.id,
      employeeId: row.employee_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      refreshTokenVersion: row.refresh_token_version,
      isActive: row.is_active,
      ...(row.last_login_at !== null && { lastLoginAt: row.last_login_at }),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    if (row.mfa_enabled) {
      return { ...base, mfaEnabled: true as const, mfaSecret: row.mfa_secret! };
    }
    if (row.mfa_secret) {
      return { ...base, mfaEnabled: false as const, mfaSecret: row.mfa_secret };
    }
    return { ...base, mfaEnabled: false as const };
  }
}

export default new AuthRepository();
