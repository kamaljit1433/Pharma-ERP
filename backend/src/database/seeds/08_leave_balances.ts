import { Knex } from 'knex';

// Leave type IDs (from 06_leave_types.ts)
const CL  = '00000002-0000-0000-0000-000000000001';
const SL  = '00000002-0000-0000-0000-000000000002';
const EL  = '00000002-0000-0000-0000-000000000003';
const ML  = '00000002-0000-0000-0000-000000000004';
const PL  = '00000002-0000-0000-0000-000000000005';

const YEAR = 2026;

function bal(
  employeeId: string,
  leaveTypeId: string,
  opening: number,
  carry: number,
  used: number
) {
  return {
    employee_id: employeeId,
    leave_type_id: leaveTypeId,
    year: YEAR,
    opening_balance: opening,
    carry_forward_balance: carry,
    used_balance: used,
    available_balance: opening + carry - used,
  };
}

export async function seed(knex: Knex): Promise<void> {
  await knex('leave_balances').del();

  const records = [
    // EMP001 – Admin User (male, CEO)
    bal('e0000000-0000-0000-0000-000000000001', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000001', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000001', EL, 21, 5,  0),
    bal('e0000000-0000-0000-0000-000000000001', PL, 15, 0,  0),

    // EMP002 – Sarah Johnson (female, HR Director)
    bal('e0000000-0000-0000-0000-000000000002', CL, 12, 2,  0),
    bal('e0000000-0000-0000-0000-000000000002', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000002', EL, 21, 3,  0),
    bal('e0000000-0000-0000-0000-000000000002', ML, 180, 0, 0),

    // EMP003 – Michael Chen (male, Finance Director)
    bal('e0000000-0000-0000-0000-000000000003', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000003', SL, 12, 2,  0),
    bal('e0000000-0000-0000-0000-000000000003', EL, 21, 10, 0),
    bal('e0000000-0000-0000-0000-000000000003', PL, 15, 0,  0),

    // EMP004 – Robert Martinez (male, IT Director)
    bal('e0000000-0000-0000-0000-000000000004', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000004', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000004', EL, 21, 7,  0),
    bal('e0000000-0000-0000-0000-000000000004', PL, 15, 0,  0),

    // EMP005 – Emily Davis (female, Engineering Manager)
    bal('e0000000-0000-0000-0000-000000000005', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000005', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000005', EL, 21, 8,  0),
    bal('e0000000-0000-0000-0000-000000000005', ML, 180, 0, 0),

    // EMP006 – John Doe (male, Senior SE) — used 1 CL on Apr 22
    bal('e0000000-0000-0000-0000-000000000006', CL, 12, 0,  1),
    bal('e0000000-0000-0000-0000-000000000006', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000006', EL, 21, 0,  0),
    bal('e0000000-0000-0000-0000-000000000006', PL, 15, 0,  0),

    // EMP007 – Jane Smith (female, SE) — used 2 SL on Mar 10-11
    bal('e0000000-0000-0000-0000-000000000007', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000007', SL, 12, 1,  2),
    bal('e0000000-0000-0000-0000-000000000007', EL, 21, 0,  0),
    bal('e0000000-0000-0000-0000-000000000007', ML, 180, 0, 0),

    // EMP008 – Mike Johnson (male, Junior SE) — no leaves taken
    bal('e0000000-0000-0000-0000-000000000008', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000008', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000008', EL, 21, 0,  0),
    bal('e0000000-0000-0000-0000-000000000008', PL, 15, 0,  0),

    // EMP009 – Sarah Williams (female, QA) — used 3 EL on Mar 16-18
    bal('e0000000-0000-0000-0000-000000000009', CL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000009', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000009', EL, 21, 5,  3),
    bal('e0000000-0000-0000-0000-000000000009', ML, 180, 0, 0),

    // EMP010 – David Brown (male, Senior Sales) — used 0.5 CL (half-day Mar 24) + 2 CL (Apr 14-15)
    bal('e0000000-0000-0000-0000-000000000010', CL, 12, 0,  2.5),
    bal('e0000000-0000-0000-0000-000000000010', SL, 12, 0,  0),
    bal('e0000000-0000-0000-0000-000000000010', EL, 21, 0,  0),
    bal('e0000000-0000-0000-0000-000000000010', PL, 15, 0,  0),
  ];

  await knex('leave_balances').insert(records);
  console.log(`Leave balances seeded: ${records.length} records`);
}
