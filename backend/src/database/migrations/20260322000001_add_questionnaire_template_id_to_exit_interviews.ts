import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('exit_interviews', (table) => {
    table
      .uuid('questionnaire_template_id')
      .nullable()
      .references('id')
      .inTable('questionnaire_templates')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('exit_interviews', (table) => {
    table.dropColumn('questionnaire_template_id');
  });
}
