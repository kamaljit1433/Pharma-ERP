import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('leaves').del();
  console.log('Leaves cleared');
}
