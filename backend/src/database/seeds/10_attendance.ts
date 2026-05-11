import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('attendance').del();
  console.log('Attendance cleared');
}
