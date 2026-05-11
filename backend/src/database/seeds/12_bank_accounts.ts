import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('bank_accounts').del();
  console.log('Bank accounts cleared');
}
