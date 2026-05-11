import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('salary_structures').del();
  console.log('Salary structures cleared');
}
