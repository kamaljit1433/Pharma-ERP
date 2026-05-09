import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Cascades to leave_balances and leaves
  await knex('leave_types').del();

  await knex('leave_types').insert([
    {
      id: '00000002-0000-0000-0000-000000000001',
      name: 'Casual Leave',
      code: 'CL',
      annual_limit: 12,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 0,
      is_active: true,
    },
    {
      id: '00000002-0000-0000-0000-000000000002',
      name: 'Sick Leave',
      code: 'SL',
      annual_limit: 12,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 6,
      is_active: true,
    },
    {
      id: '00000002-0000-0000-0000-000000000003',
      name: 'Earned Leave',
      code: 'EL',
      annual_limit: 21,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 30,
      is_active: true,
    },
    {
      id: '00000002-0000-0000-0000-000000000004',
      name: 'Maternity Leave',
      code: 'ML',
      annual_limit: 180,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 0,
      is_active: true,
    },
    {
      id: '00000002-0000-0000-0000-000000000005',
      name: 'Paternity Leave',
      code: 'PL',
      annual_limit: 15,
      is_paid: true,
      requires_approval: true,
      carry_forward_limit: 0,
      is_active: true,
    },
    {
      id: '00000002-0000-0000-0000-000000000006',
      name: 'Leave Without Pay',
      code: 'LWP',
      annual_limit: 0,
      is_paid: false,
      requires_approval: true,
      carry_forward_limit: 0,
      is_active: true,
    },
  ]);

  console.log('Leave types seeded successfully');
}
