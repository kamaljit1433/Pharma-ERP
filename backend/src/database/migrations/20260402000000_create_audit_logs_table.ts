import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary();
    table.string('entity_type').notNullable().index();
    table.uuid('entity_id').notNullable().index();
    table.string('action').notNullable();
    table.uuid('performed_by').nullable();
    table.jsonb('changes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Composite index for common queries
    table.index(['entity_type', 'entity_id']);
    table.index(['entity_type', 'action']);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
