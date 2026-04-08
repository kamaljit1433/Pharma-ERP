import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notification_templates', (table) => {
    table.string('type', 100).nullable();
  });

  // Make channel nullable by altering the column
  await knex.raw(`ALTER TABLE notification_templates ALTER COLUMN channel DROP NOT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notification_templates', (table) => {
    table.dropColumn('type');
  });
  await knex.raw(`ALTER TABLE notification_templates ALTER COLUMN channel SET NOT NULL`);
}
