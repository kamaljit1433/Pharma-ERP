import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('advance_salary_requests').del();
  console.log('Advance salary requests cleared');
}
