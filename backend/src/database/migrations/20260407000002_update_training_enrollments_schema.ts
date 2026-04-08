import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add program_id column as alias for training_program_id
  await knex.schema.alterTable('training_enrollments', (table) => {
    table.uuid('program_id').nullable().references('id').inTable('training_programs').onDelete('CASCADE');
  });

  // Backfill program_id from training_program_id
  await knex.raw('UPDATE training_enrollments SET program_id = training_program_id WHERE program_id IS NULL');

  // Drop the unique constraint to allow multiple enrollments per employee/program pair
  await knex.raw('ALTER TABLE training_enrollments DROP CONSTRAINT IF EXISTS training_enrollments_employee_id_training_program_id_unique');

  // Expand status enum to include 'dropped'
  await knex.raw(`ALTER TABLE training_enrollments DROP CONSTRAINT IF EXISTS training_enrollments_status_check`);
  await knex.raw(`
    ALTER TABLE training_enrollments
    ADD CONSTRAINT training_enrollments_status_check
    CHECK (status IN ('enrolled', 'in_progress', 'completed', 'cancelled', 'dropped'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('training_enrollments', (table) => {
    table.dropColumn('program_id');
  });

  await knex.raw(`ALTER TABLE training_enrollments DROP CONSTRAINT IF EXISTS training_enrollments_status_check`);
  await knex.raw(`
    ALTER TABLE training_enrollments
    ADD CONSTRAINT training_enrollments_status_check
    CHECK (status IN ('enrolled', 'in_progress', 'completed', 'cancelled'))
  `);

  await knex.raw(`
    ALTER TABLE training_enrollments
    ADD CONSTRAINT training_enrollments_employee_id_training_program_id_unique
    UNIQUE (employee_id, training_program_id)
  `);
}
