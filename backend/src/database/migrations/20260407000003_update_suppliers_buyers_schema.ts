import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('suppliers_buyers', (table) => {
    table.string('postal_code', 20).nullable();
  });

  // Widen name column for edge case tests (500 char names)
  await knex.raw('ALTER TABLE suppliers_buyers ALTER COLUMN name TYPE VARCHAR(1000)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('suppliers_buyers', (table) => {
    table.dropColumn('postal_code');
  });

  await knex.raw('ALTER TABLE suppliers_buyers ALTER COLUMN name TYPE VARCHAR(100)');
}
