import { Knex } from 'knex';

const CL = '00000002-0000-0000-0000-000000000001';
const SL = '00000002-0000-0000-0000-000000000002';
const EL = '00000002-0000-0000-0000-000000000003';
const PL = '00000002-0000-0000-0000-000000000005';

const YEAR = 2026;

const EMPLOYEES = [
  'e0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000003',
  'e0000000-0000-0000-0000-000000000004',
  'e0000000-0000-0000-0000-000000000005',
  'e0000000-0000-0000-0000-000000000006',
  'e0000000-0000-0000-0000-000000000007',
  'e0000000-0000-0000-0000-000000000008',
];

function bal(employeeId: string, leaveTypeId: string, opening: number, carry: number = 0) {
  return {
    employee_id: employeeId,
    leave_type_id: leaveTypeId,
    year: YEAR,
    opening_balance: opening,
    carry_forward_balance: carry,
    used_balance: 0,
    available_balance: opening + carry,
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('leave_balances').del();

  const records = EMPLOYEES.flatMap((empId) => [
    bal(empId, CL, 12),
    bal(empId, SL, 12),
    bal(empId, EL, 21),
    bal(empId, PL, 15),
  ]);

  await knex('leave_balances').insert(records);
  console.log(`Leave balances seeded: ${records.length} records (8 employees × 4 leave types)`);
}
