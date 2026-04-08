import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('skills', (table) => {
    table.jsonb('proficiency_levels').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('skills', (table) => {
    table.dropColumn('proficiency_levels');
    table.dropColumn('updated_at');
  });
}
