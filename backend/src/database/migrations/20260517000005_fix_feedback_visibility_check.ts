import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_visibility_check`);
  await knex.raw(`ALTER TABLE feedback ADD CONSTRAINT feedback_visibility_check CHECK (visibility IN ('Private', 'Manager Only', 'Public'))`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_visibility_check`);
  await knex.raw(`ALTER TABLE feedback ADD CONSTRAINT feedback_visibility_check CHECK (visibility IN ('private', 'manager', 'public'))`);
}
