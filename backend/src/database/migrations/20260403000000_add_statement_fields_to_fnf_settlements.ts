import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fnf_settlements', (table) => {
    table.string('statement_file_key').nullable();
    table.string('statement_file_url').nullable();
    table.timestamp('statement_generated_at').nullable();
  });

  console.log('Added statement file fields to fnf_settlements table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fnf_settlements', (table) => {
    table.dropColumn('statement_file_key');
    table.dropColumn('statement_file_url');
    table.dropColumn('statement_generated_at');
  });
}
