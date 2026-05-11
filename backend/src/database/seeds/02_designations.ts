import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('designations').del();

  await knex('designations').insert([
    {
      id: 'd1111111-1111-1111-1111-111111111111',
      name: 'System Administrator',
      description: 'Full system access and administration',
      level: 'Executive',
    },
    {
      id: 'd2222222-2222-2222-2222-222222222222',
      name: 'HR Manager',
      description: 'Manages a team of HR employees',
      level: 'Manager',
    },
    {
      id: 'd3333333-3333-3333-3333-333333333333',
      name: 'HR Executive',
      description: 'HR team member',
      level: 'Mid',
    },
  ]);

  console.log('Designations seeded (3)');
}
