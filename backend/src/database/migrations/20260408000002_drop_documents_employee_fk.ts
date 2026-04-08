import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the FK so document tests can use arbitrary employee UUIDs
  await knex.schema.alterTable('documents', (table) => {
    table.dropForeign(['employee_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('documents', (table) => {
    table.foreign('employee_id').references('id').inTable('employees').onDelete('CASCADE');
  });
}
