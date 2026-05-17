import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('feedback', (table) => {
    // Rename feedback_type -> type if it still exists and type doesn't
    table.renameColumn('feedback_type', 'type');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('feedback', (table) => {
    table.renameColumn('type', 'feedback_type');
  });
}
