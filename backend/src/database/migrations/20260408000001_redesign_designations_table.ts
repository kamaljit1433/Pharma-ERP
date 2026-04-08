import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('designations', (table) => {
    // Add new columns
    table.string('name', 100).nullable();
    table.text('description').nullable();
    // Change level from integer to string
    table.string('level', 50).nullable().alter();
  });

  // Copy title -> name for any existing rows
  await knex.raw('UPDATE designations SET name = title WHERE name IS NULL');

  await knex.schema.alterTable('designations', (table) => {
    // Make name not nullable after backfill
    table.string('name', 100).notNullable().alter();
    // Drop old required columns
    table.dropColumn('title');
    table.dropColumn('grade');
    table.dropForeign(['department_id']);
    table.dropColumn('department_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('designations', (table) => {
    table.string('title', 100).nullable();
    table.string('grade', 20).nullable();
    table.uuid('department_id').nullable();
    table.dropColumn('name');
    table.dropColumn('description');
  });
}
