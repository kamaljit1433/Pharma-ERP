import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password for all users (password: "Password123!")
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Insert seed entries
  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      employee_id: 'EMP001',
      email: 'admin@company.com',
      password_hash: passwordHash,
      role: 'super_admin',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      employee_id: 'EMP002',
      email: 'hr.manager@company.com',
      password_hash: passwordHash,
      role: 'hr_manager',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      employee_id: 'EMP003',
      email: 'finance@company.com',
      password_hash: passwordHash,
      role: 'finance',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      employee_id: 'EMP004',
      email: 'it.admin@company.com',
      password_hash: passwordHash,
      role: 'it_admin',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      employee_id: 'EMP005',
      email: 'dept.manager@company.com',
      password_hash: passwordHash,
      role: 'department_manager',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      employee_id: 'EMP006',
      email: 'john.doe@company.com',
      password_hash: passwordHash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      employee_id: 'EMP007',
      email: 'jane.smith@company.com',
      password_hash: passwordHash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      employee_id: 'EMP008',
      email: 'mike.johnson@company.com',
      password_hash: passwordHash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      employee_id: 'EMP009',
      email: 'sarah.williams@company.com',
      password_hash: passwordHash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      employee_id: 'EMP010',
      email: 'david.brown@company.com',
      password_hash: passwordHash,
      role: 'employee',
      mfa_enabled: false,
      is_active: true,
    },
  ];

  await knex('users').insert(users);
  console.log('Users seeded successfully');
  console.log('Default password for all users: Password123!');
}
