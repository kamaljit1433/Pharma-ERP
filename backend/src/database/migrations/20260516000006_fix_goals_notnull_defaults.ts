import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // start_date and end_date are legacy columns the new code doesn't use — make nullable
  await knex.raw(`ALTER TABLE goals ALTER COLUMN start_date DROP NOT NULL`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN end_date DROP NOT NULL`);

  // Fix defaults to match the updated check constraints
  await knex.raw(`ALTER TABLE goals ALTER COLUMN type SET DEFAULT 'OKR'`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'On Track'`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE goals ALTER COLUMN start_date SET NOT NULL`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN end_date SET NOT NULL`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN type SET DEFAULT 'okr'`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'draft'`);
}
