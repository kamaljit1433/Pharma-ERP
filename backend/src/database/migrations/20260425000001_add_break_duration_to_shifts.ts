import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shifts', (table) => {
    table.integer('break_duration_minutes').nullable().defaultTo(60)
      .comment('Break time in minutes deducted from gross working hours');
  });

  // Backfill existing rows with the default 60-minute break
  await knex('shifts').whereNull('break_duration_minutes').update({ break_duration_minutes: 60 });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shifts', (table) => {
    table.dropColumn('break_duration_minutes');
  });
}
