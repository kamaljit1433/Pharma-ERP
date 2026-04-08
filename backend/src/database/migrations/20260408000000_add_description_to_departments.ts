import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('departments', (table) => {
    table.text('description').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('departments', (table) => {
    table.dropColumn('description');
  });
}
