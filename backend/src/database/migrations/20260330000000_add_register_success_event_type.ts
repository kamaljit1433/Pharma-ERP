import { Knex } from 'knex';

/**
 * Adds 'register_success' to the auth_audit_log.event_type check constraint.
 *
 * Knex uses a CHECK constraint (not a native PostgreSQL enum type) for .enum() columns.
 * We drop the existing constraint and recreate it with the additional value.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE auth_audit_log DROP CONSTRAINT IF EXISTS auth_audit_log_event_type_check;
    ALTER TABLE auth_audit_log ADD CONSTRAINT auth_audit_log_event_type_check
      CHECK (event_type IN (
        'login_success',
        'login_failed',
        'logout',
        'token_refresh',
        'mfa_enabled',
        'mfa_disabled',
        'mfa_verified',
        'mfa_failed',
        'password_reset_requested',
        'password_reset_completed',
        'password_changed',
        'oauth_login',
        'register_success'
      ));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE auth_audit_log DROP CONSTRAINT IF EXISTS auth_audit_log_event_type_check;
    ALTER TABLE auth_audit_log ADD CONSTRAINT auth_audit_log_event_type_check
      CHECK (event_type IN (
        'login_success',
        'login_failed',
        'logout',
        'token_refresh',
        'mfa_enabled',
        'mfa_disabled',
        'mfa_verified',
        'mfa_failed',
        'password_reset_requested',
        'password_reset_completed',
        'password_changed',
        'oauth_login'
      ));
  `);
}
