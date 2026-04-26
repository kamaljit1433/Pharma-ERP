import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table) => {
    table.boolean('regularization_requested').notNullable().defaultTo(false)
      .comment('True when a regularization request is pending or approved for this record');
  });

  // Backfill: mark attendance records that already have a regularization request
  await knex.raw(`
    UPDATE attendance
    SET regularization_requested = TRUE
    WHERE id IN (
      SELECT DISTINCT attendance_id
      FROM attendance_regularization_requests
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table) => {
    table.dropColumn('regularization_requested');
  });
}
