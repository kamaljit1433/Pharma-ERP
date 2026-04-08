import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add duration_days column
  await knex.schema.alterTable('training_programs', (table) => {
    table.integer('duration_days').nullable();
  });

  // Make start_date, end_date, duration_hours nullable
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN start_date DROP NOT NULL');
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN end_date DROP NOT NULL');
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN duration_hours DROP NOT NULL');

  // Expand status enum to include inactive and archived
  await knex.raw(`ALTER TABLE training_programs DROP CONSTRAINT IF EXISTS training_programs_status_check`);
  await knex.raw(`
    ALTER TABLE training_programs
    ADD CONSTRAINT training_programs_status_check
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'inactive', 'archived'))
  `);

  // Make name column longer to support edge case tests
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN name TYPE VARCHAR(1000)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('training_programs', (table) => {
    table.dropColumn('duration_days');
  });

  await knex.raw('ALTER TABLE training_programs ALTER COLUMN start_date SET NOT NULL');
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN end_date SET NOT NULL');
  await knex.raw('ALTER TABLE training_programs ALTER COLUMN duration_hours SET NOT NULL');

  await knex.raw(`ALTER TABLE training_programs DROP CONSTRAINT IF EXISTS training_programs_status_check`);
  await knex.raw(`
    ALTER TABLE training_programs
    ADD CONSTRAINT training_programs_status_check
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled'))
  `);

  await knex.raw('ALTER TABLE training_programs ALTER COLUMN name TYPE VARCHAR(100)');
}
