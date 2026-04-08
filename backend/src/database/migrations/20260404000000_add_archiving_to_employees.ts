import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add archiving fields to employees table
  await knex.schema.alterTable('employees', (table) => {
    table.timestamp('archived_at').nullable();
    table.string('archive_reason', 255).nullable();
    table.index('archived_at');
  });

  console.log('Archiving fields added to employees table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('employees', (table) => {
    table.dropIndex('archived_at');
    table.dropColumn('archive_reason');
    table.dropColumn('archived_at');
  });
}
