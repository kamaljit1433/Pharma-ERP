import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('signature_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('document_id', 255).notNullable();
    table.string('requester_id', 255).notNullable();
    table.jsonb('signers').notNullable().defaultTo('[]');
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('document_id');
    table.index('requester_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('signature_requests');
}
