import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('departments').del();

  await knex('departments').insert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Executive Management',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Human Resources',
      parent_department_id: null,
      head_employee_id: null,
    },
  ]);

  console.log('Departments seeded (2)');
}
