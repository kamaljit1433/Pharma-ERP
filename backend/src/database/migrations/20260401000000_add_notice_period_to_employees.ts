import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add notice_period_days to employees table
  await knex.schema.table('employees', (table) => {
    table.integer('notice_period_days').notNullable().defaultTo(30);
  });

  // Add notice_period_end_date to resignations table
  await knex.schema.table('resignations', (table) => {
    table.date('notice_period_end_date').nullable();
    table.integer('notice_period_days').nullable();
    table.enum('notice_period_status', ['pending', 'served', 'early_exit', 'buyout']).nullable().defaultTo('pending');
  });

  console.log('Added notice period fields to employees and resignations tables');
}

export async function down(knex: Knex): Promise<void> {
  // Remove notice_period_end_date, notice_period_days, and notice_period_status from resignations
  await knex.schema.table('resignations', (table) => {
    table.dropColumn('notice_period_end_date');
    table.dropColumn('notice_period_days');
    table.dropColumn('notice_period_status');
  });

  // Remove notice_period_days from employees
  await knex.schema.table('employees', (table) => {
    table.dropColumn('notice_period_days');
  });
}
