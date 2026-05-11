import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table) => {
    table.decimal('working_hours', 5, 2).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table) => {
    table.integer('working_hours').nullable().alter();
  });
}
