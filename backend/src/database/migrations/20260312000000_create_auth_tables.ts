import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('employee_id', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', [
      'super_admin',
      'hr_manager',
      'department_manager',
      'finance',
      'employee',
      'it_admin',
    ]).notNullable().defaultTo('employee');
    table.boolean('mfa_enabled').notNullable().defaultTo(false);
    table.string('mfa_secret', 255).nullable();
    table.integer('refresh_token_version').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('last_login_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('employee_id');
    table.index('email');
    table.index('is_active');
  });

  // Create MFA backup codes table
  await knex.schema.createTable('mfa_backup_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('code_hash', 255).notNullable();
    table.boolean('used').notNullable().defaultTo(false);
    table.timestamp('used_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index(['user_id', 'used']);
  });

  // Create OAuth accounts table
  await knex.schema.createTable('oauth_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('provider', ['google', 'microsoft']).notNullable();
    table.string('provider_account_id', 255).notNullable();
    table.string('access_token', 500).nullable();
    table.string('refresh_token', 500).nullable();
    table.timestamp('token_expires_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Unique constraint on provider + provider_account_id
    table.unique(['provider', 'provider_account_id']);
    
    // Indexes
    table.index('user_id');
    table.index(['provider', 'provider_account_id']);
  });

  // Create password reset tokens table
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 255).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').notNullable().defaultTo(false);
    table.timestamp('used_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('token');
    table.index(['token', 'used', 'expires_at']);
  });

  // Create audit log table for authentication events
  await knex.schema.createTable('auth_audit_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('email', 255).notNullable();
    table.enum('event_type', [
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
    ]).notNullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('email');
    table.index('event_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auth_audit_log');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('oauth_accounts');
  await knex.schema.dropTableIfExists('mfa_backup_codes');
  await knex.schema.dropTableIfExists('users');
}
