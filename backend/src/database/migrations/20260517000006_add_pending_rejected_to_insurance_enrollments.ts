import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE insurance_enrollments
      DROP CONSTRAINT IF EXISTS insurance_enrollments_status_check
  `);
  await knex.raw(`
    ALTER TABLE insurance_enrollments
      ADD CONSTRAINT insurance_enrollments_status_check
      CHECK (status IN ('active', 'inactive', 'cancelled', 'pending', 'rejected'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE insurance_enrollments
      DROP CONSTRAINT IF EXISTS insurance_enrollments_status_check
  `);
  await knex.raw(`
    ALTER TABLE insurance_enrollments
      ADD CONSTRAINT insurance_enrollments_status_check
      CHECK (status IN ('active', 'inactive', 'cancelled'))
  `);
}
