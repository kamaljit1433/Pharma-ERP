import { Knex } from 'knex';
import bcrypt from 'bcrypt';

// ─── RBAC Test Users ──────────────────────────────────────────────────────────
// All passwords: Password123!
//
// Role          | employee_id | email
// super_admin   | EMP001      | admin@company.com
// hr_manager    | EMP002      | hr1@company.com       (team: EMP004, EMP005, EMP006)
// hr_manager    | EMP003      | hr2@company.com       (team: EMP007, EMP008)
// employee      | EMP004      | emp1.alpha@company.com
// employee      | EMP005      | emp2.alpha@company.com
// employee      | EMP006      | emp3.alpha@company.com
// employee      | EMP007      | emp1.beta@company.com
// employee      | EMP008      | emp2.beta@company.com
// it_admin      | EMP009      | it@company.com

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const hash = await bcrypt.hash('Password123!', 10);

  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      employee_id: 'EMP001',
      email: 'admin@company.com',
      password_hash: hash,
      role: 'super_admin',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      employee_id: 'EMP002',
      email: 'hr1@company.com',
      password_hash: hash,
      role: 'hr_manager',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      employee_id: 'EMP003',
      email: 'hr2@company.com',
      password_hash: hash,
      role: 'hr_manager',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      employee_id: 'EMP004',
      email: 'emp1.alpha@company.com',
      password_hash: hash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      employee_id: 'EMP005',
      email: 'emp2.alpha@company.com',
      password_hash: hash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      employee_id: 'EMP006',
      email: 'emp3.alpha@company.com',
      password_hash: hash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      employee_id: 'EMP007',
      email: 'emp1.beta@company.com',
      password_hash: hash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      employee_id: 'EMP008',
      email: 'emp2.beta@company.com',
      password_hash: hash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      employee_id: 'EMP009',
      email: 'it@company.com',
      password_hash: hash,
      role: 'it_admin',
      mfa_enabled: false,
      is_active: true,
    },
  ]);

  console.log('Users seeded (9) — password: Password123!');
}
