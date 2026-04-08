import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add missing columns to shifts table
  await knex.schema.alterTable('shifts', (table) => {
    table.string('shift_type', 50).nullable();
    table.string('rotation_pattern', 255).nullable();
    table.integer('min_hours').nullable();
    table.integer('max_hours').nullable();
  });

  // Make start_time, end_time, duration_minutes nullable
  await knex.raw('ALTER TABLE shifts ALTER COLUMN start_time DROP NOT NULL');
  await knex.raw('ALTER TABLE shifts ALTER COLUMN end_time DROP NOT NULL');
  await knex.raw('ALTER TABLE shifts ALTER COLUMN duration_minutes DROP NOT NULL');

  // Backfill shift_type from type
  await knex.raw("UPDATE shifts SET shift_type = type::text WHERE shift_type IS NULL");

  // Create employee_shifts table
  await knex.schema.createTable('employee_shifts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable();
    table.uuid('shift_id').nullable().references('id').inTable('shifts').onDelete('SET NULL');
    table.date('effective_from').notNullable().defaultTo(knex.fn.now());
    table.date('effective_to').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('shift_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employee_shifts');

  await knex.schema.alterTable('shifts', (table) => {
    table.dropColumn('shift_type');
    table.dropColumn('rotation_pattern');
    table.dropColumn('min_hours');
    table.dropColumn('max_hours');
  });

  await knex.raw('ALTER TABLE shifts ALTER COLUMN start_time SET NOT NULL');
  await knex.raw('ALTER TABLE shifts ALTER COLUMN end_time SET NOT NULL');
  await knex.raw('ALTER TABLE shifts ALTER COLUMN duration_minutes SET NOT NULL');
}
