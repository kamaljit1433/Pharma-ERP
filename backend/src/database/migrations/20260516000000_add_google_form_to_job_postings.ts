import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('job_postings', (table) => {
    table.string('form_id').nullable();
    table.string('form_url').nullable();
    // pending = not yet attempted, generated = form exists, failed = creation failed
    table.string('form_status').defaultTo('pending').notNullable();
    // ISO timestamp of the last response we processed — used by the sync cron
    table.timestamp('form_last_synced_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('job_postings', (table) => {
    table.dropColumn('form_id');
    table.dropColumn('form_url');
    table.dropColumn('form_status');
    table.dropColumn('form_last_synced_at');
  });
}
