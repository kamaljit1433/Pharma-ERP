import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('departments').del();

  // Insert seed entries
  const departments = [
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
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Finance & Accounting',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Information Technology',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Sales & Marketing',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      name: 'Operations',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      name: 'Customer Support',
      parent_department_id: null,
      head_employee_id: null,
    },
    {
      id: '88888888-8888-8888-8888-888888888888',
      name: 'Research & Development',
      parent_department_id: null,
      head_employee_id: null,
    },
  ];

  await knex('departments').insert(departments);
  console.log('Departments seeded successfully');
}
