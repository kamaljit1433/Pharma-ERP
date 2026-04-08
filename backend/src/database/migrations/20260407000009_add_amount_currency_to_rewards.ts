import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rewards', (table) => {
    table.decimal('amount', 15, 2).nullable().defaultTo(0);
    table.string('currency', 10).nullable().defaultTo('USD');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rewards', (table) => {
    table.dropColumn('amount');
    table.dropColumn('currency');
    table.dropColumn('updated_at');
  });
}
