import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Make employee_id nullable to support visits created without a specific employee
  await knex.raw('ALTER TABLE visits ALTER COLUMN employee_id DROP NOT NULL');

  await knex.schema.alterTable('visits', (table) => {
    table.uuid('record_id').nullable().references('id').inTable('suppliers_buyers').onDelete('CASCADE');
    table.integer('duration_minutes').nullable();
  });

  // Backfill record_id from supplier_buyer_id
  await knex.raw('UPDATE visits SET record_id = supplier_buyer_id WHERE record_id IS NULL');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('visits', (table) => {
    table.dropColumn('record_id');
    table.dropColumn('duration_minutes');
  });

  await knex.raw('ALTER TABLE visits ALTER COLUMN employee_id SET NOT NULL');
}
