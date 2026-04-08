import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payroll', (table) => {
    table.decimal('basic_salary', 15, 2).nullable();
    table.decimal('pf_deduction', 15, 2).nullable().defaultTo(0);
    table.decimal('esi_deduction', 15, 2).nullable().defaultTo(0);
    table.decimal('tds_deduction', 15, 2).nullable().defaultTo(0);
    table.boolean('is_locked').notNullable().defaultTo(false);
    table.timestamp('locked_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payroll', (table) => {
    table.dropColumn('basic_salary');
    table.dropColumn('pf_deduction');
    table.dropColumn('esi_deduction');
    table.dropColumn('tds_deduction');
    table.dropColumn('is_locked');
    table.dropColumn('locked_at');
  });
}
