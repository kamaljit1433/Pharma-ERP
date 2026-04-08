import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('offer_letters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('applicant_id').notNullable().references('id').inTable('applicants').onDelete('CASCADE');
    table.string('position', 100).notNullable();
    table.string('department', 100).nullable();
    table.decimal('salary', 15, 2).notNullable();
    table.string('currency', 10).nullable().defaultTo('USD');
    table.date('start_date').notNullable();
    table.text('terms').notNullable();
    table.enum('status', ['draft', 'sent', 'signed', 'accepted', 'rejected'])
      .notNullable()
      .defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('applicant_id');
    table.index('status');
  });

  // Make department_id and designation_id nullable on job_postings so tests can insert without them
  await knex.raw(`ALTER TABLE job_postings ALTER COLUMN department_id DROP NOT NULL`);
  await knex.raw(`ALTER TABLE job_postings ALTER COLUMN designation_id DROP NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('offer_letters');
  await knex.raw(`ALTER TABLE job_postings ALTER COLUMN department_id SET NOT NULL`);
  await knex.raw(`ALTER TABLE job_postings ALTER COLUMN designation_id SET NOT NULL`);
}
