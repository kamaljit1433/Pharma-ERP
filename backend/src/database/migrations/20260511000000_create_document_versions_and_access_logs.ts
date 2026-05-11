import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasVersions = await knex.schema.hasTable('document_versions');
  if (!hasVersions) {
    await knex.schema.createTable('document_versions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
      table.integer('version_number').notNullable();
      table.string('file_url').notNullable();
      table.uuid('uploaded_by').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('document_id');
      table.index('version_number');
      table.unique(['document_id', 'version_number']);
    });
  }

  const hasAccessLogs = await knex.schema.hasTable('document_access_logs');
  if (!hasAccessLogs) {
    await knex.schema.createTable('document_access_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
      table.uuid('accessed_by').notNullable();
      table.enum('access_type', ['view', 'download', 'delete']).notNullable();
      table.string('ip_address', 45).nullable();
      table.string('user_agent', 500).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('document_id');
      table.index('accessed_by');
      table.index('created_at');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('document_access_logs');
  await knex.schema.dropTableIfExists('document_versions');
}
