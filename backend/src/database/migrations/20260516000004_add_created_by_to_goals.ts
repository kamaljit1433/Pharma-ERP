import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('goals', 'created_by');
  if (!hasColumn) {
    await knex.schema.alterTable('goals', (table) => {
      table.uuid('created_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('goals', 'created_by');
  if (hasColumn) {
    await knex.schema.alterTable('goals', (table) => {
      table.dropColumn('created_by');
    });
  }
}
