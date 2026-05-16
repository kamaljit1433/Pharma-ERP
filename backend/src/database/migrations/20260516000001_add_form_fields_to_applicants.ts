import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('applicants', (table) => {
    // 'google_form' | 'manual' — how this applicant was added
    table.string('source').defaultTo('manual').notNullable();
    // Google Forms responseId — prevents duplicate imports
    table.string('form_response_id').nullable().unique();
    // cover_letter already exists in the original migration — skip it
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('applicants', (table) => {
    table.dropColumn('source');
    table.dropColumn('form_response_id');
  });
}
