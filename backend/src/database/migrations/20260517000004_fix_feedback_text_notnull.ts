import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE feedback ALTER COLUMN feedback_text DROP NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE feedback ALTER COLUMN feedback_text SET NOT NULL`);
}
