import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Remove any existing duplicate rows (keep the most recently updated one)
  await knex.raw(`
    DELETE FROM attendance a
    USING attendance b
    WHERE a.id < b.id
      AND a.employee_id = b.employee_id
      AND a.attendance_date = b.attendance_date
  `);

  await knex.schema.alterTable('attendance', (table) => {
    table.unique(['employee_id', 'attendance_date'], { indexName: 'attendance_employee_date_unique' });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attendance', (table) => {
    table.dropUnique(['employee_id', 'attendance_date'], 'attendance_employee_date_unique');
  });
}
