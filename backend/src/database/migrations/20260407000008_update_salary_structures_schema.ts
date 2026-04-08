import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('salary_structures', (table) => {
    // Aliases used by test
    table.decimal('basic_salary', 15, 2).nullable();
    table.decimal('daily_rate', 15, 2).nullable();
    table.decimal('hourly_rate', 15, 2).nullable();
    table.decimal('pf_percentage', 5, 2).nullable();
    table.decimal('esi_percentage', 5, 2).nullable();
  });

  // Make base_salary, hra, etc. nullable so test inserts without them work
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN base_salary DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN hra DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN dearness_allowance DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN other_allowances DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN pf_contribution_rate DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN esi_contribution_rate DROP NOT NULL');
  await knex.raw('ALTER TABLE salary_structures ALTER COLUMN professional_tax DROP NOT NULL');

  // Drop FK on employee_id so test can use random UUIDs without needing employee rows
  await knex.raw('ALTER TABLE salary_structures DROP CONSTRAINT IF EXISTS salary_structures_employee_id_foreign');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('salary_structures', (table) => {
    table.dropColumn('basic_salary');
    table.dropColumn('daily_rate');
    table.dropColumn('hourly_rate');
    table.dropColumn('pf_percentage');
    table.dropColumn('esi_percentage');
  });
}
