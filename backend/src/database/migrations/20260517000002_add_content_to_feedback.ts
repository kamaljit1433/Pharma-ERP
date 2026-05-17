import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasContent = await knex.schema.hasColumn('feedback', 'content');
  if (!hasContent) {
    await knex.schema.alterTable('feedback', (table) => {
      table.text('content').notNullable().defaultTo('');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasContent = await knex.schema.hasColumn('feedback', 'content');
  if (hasContent) {
    await knex.schema.alterTable('feedback', (table) => {
      table.dropColumn('content');
    });
  }
}
