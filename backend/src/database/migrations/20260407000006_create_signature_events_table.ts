import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('signature_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('request_id').notNullable().references('id').inTable('signature_requests').onDelete('CASCADE');
    table.string('signer_id', 255).notNullable();
    table.string('event_type', 50).notNullable();
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 1000).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('request_id');
    table.index('signer_id');
    table.index('event_type');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('signature_events');
}
