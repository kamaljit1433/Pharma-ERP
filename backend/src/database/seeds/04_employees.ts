import { Knex } from 'knex';

// Dept IDs
const EXEC = '11111111-1111-1111-1111-111111111111';
const HR   = '22222222-2222-2222-2222-222222222222';

// Designation IDs
const D_ADMIN   = 'd1111111-1111-1111-1111-111111111111';
const D_MANAGER = 'd2222222-2222-2222-2222-222222222222';
const D_EXEC    = 'd3333333-3333-3333-3333-333333333333';

// Employee UUIDs
const E1 = 'e0000000-0000-0000-0000-000000000001'; // Super Admin
const E2 = 'e0000000-0000-0000-0000-000000000002'; // HR Manager 1
const E3 = 'e0000000-0000-0000-0000-000000000003'; // HR Manager 2
const E4 = 'e0000000-0000-0000-0000-000000000004'; // Emp Alpha 1
const E5 = 'e0000000-0000-0000-0000-000000000005'; // Emp Alpha 2
const E6 = 'e0000000-0000-0000-0000-000000000006'; // Emp Alpha 3
const E7 = 'e0000000-0000-0000-0000-000000000007'; // Emp Beta 1
const E8 = 'e0000000-0000-0000-0000-000000000008'; // Emp Beta 2
const E9 = 'e0000000-0000-0000-0000-000000000009'; // IT Admin

// IT Dept / Designation IDs
const IT   = '33333333-3333-3333-3333-333333333333';
const D_IT = 'd4444444-4444-4444-4444-444444444444';

export async function seed(knex: Knex): Promise<void> {
  await knex('employees').del();

  await knex('employees').insert([
    // ── Super Admin ────────────────────────────────────────────────────────
    {
      id: E1,
      employee_id: 'EMP001',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@company.com',
      phone: '+91-9000000001',
      date_of_birth: '1980-01-15',
      gender: 'male',
      blood_group: 'O+',
      address: '1 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
      pan: 'AABCU1234F',
      aadhar: '1111-2222-3333',
      department_id: EXEC,
      designation_id: D_ADMIN,
      reporting_manager_id: null,
      date_of_joining: '2020-01-01',
      employment_type: 'permanent',
      status: 'active',
    },

    // ── HR Manager 1 (Alpha team — 3 direct reports) ───────────────────────
    {
      id: E2,
      employee_id: 'EMP002',
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'hr1@company.com',
      phone: '+91-9000000002',
      date_of_birth: '1985-06-20',
      gender: 'female',
      blood_group: 'A+',
      address: '2 Manager Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400002',
      country: 'India',
      pan: 'BBBCU2345G',
      aadhar: '2222-3333-4444',
      department_id: HR,
      designation_id: D_MANAGER,
      reporting_manager_id: E1,
      date_of_joining: '2020-03-01',
      employment_type: 'permanent',
      status: 'active',
    },

    // ── HR Manager 2 (Beta team — 2 direct reports) ────────────────────────
    {
      id: E3,
      employee_id: 'EMP003',
      first_name: 'Rahul',
      last_name: 'Verma',
      email: 'hr2@company.com',
      phone: '+91-9000000003',
      date_of_birth: '1983-11-10',
      gender: 'male',
      blood_group: 'B+',
      address: '3 Manager Street',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      country: 'India',
      pan: 'CCCCU3456H',
      aadhar: '3333-4444-5555',
      department_id: HR,
      designation_id: D_MANAGER,
      reporting_manager_id: E1,
      date_of_joining: '2020-04-01',
      employment_type: 'permanent',
      status: 'active',
    },

    // ── Alpha Team Employees (report to HR Manager 1) ──────────────────────
    {
      id: E4,
      employee_id: 'EMP004',
      first_name: 'Anjali',
      last_name: 'Mehta',
      email: 'emp1.alpha@company.com',
      phone: '+91-9000000004',
      date_of_birth: '1995-02-14',
      gender: 'female',
      blood_group: 'O-',
      address: '4 Employee Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400003',
      country: 'India',
      pan: 'DDDCU4567I',
      aadhar: '4444-5555-6666',
      department_id: HR,
      designation_id: D_EXEC,
      reporting_manager_id: E2,
      date_of_joining: '2022-01-10',
      employment_type: 'permanent',
      status: 'active',
    },
    {
      id: E5,
      employee_id: 'EMP005',
      first_name: 'Ravi',
      last_name: 'Kumar',
      email: 'emp2.alpha@company.com',
      phone: '+91-9000000005',
      date_of_birth: '1996-08-22',
      gender: 'male',
      blood_group: 'A-',
      address: '5 Employee Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400004',
      country: 'India',
      pan: 'EEECV5678J',
      aadhar: '5555-6666-7777',
      department_id: HR,
      designation_id: D_EXEC,
      reporting_manager_id: E2,
      date_of_joining: '2022-03-15',
      employment_type: 'permanent',
      status: 'active',
    },
    {
      id: E6,
      employee_id: 'EMP006',
      first_name: 'Sneha',
      last_name: 'Patil',
      email: 'emp3.alpha@company.com',
      phone: '+91-9000000006',
      date_of_birth: '1997-05-30',
      gender: 'female',
      blood_group: 'B-',
      address: '6 Employee Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400005',
      country: 'India',
      pan: 'FFFCW6789K',
      aadhar: '6666-7777-8888',
      department_id: HR,
      designation_id: D_EXEC,
      reporting_manager_id: E2,
      date_of_joining: '2023-06-01',
      employment_type: 'permanent',
      status: 'active',
    },

    // ── Beta Team Employees (report to HR Manager 2) ───────────────────────
    {
      id: E7,
      employee_id: 'EMP007',
      first_name: 'Amit',
      last_name: 'Singh',
      email: 'emp1.beta@company.com',
      phone: '+91-9000000007',
      date_of_birth: '1994-09-18',
      gender: 'male',
      blood_group: 'AB+',
      address: '7 Employee Street',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411002',
      country: 'India',
      pan: 'GGGCX7890L',
      aadhar: '7777-8888-9999',
      department_id: HR,
      designation_id: D_EXEC,
      reporting_manager_id: E3,
      date_of_joining: '2021-07-01',
      employment_type: 'permanent',
      status: 'active',
    },
    {
      id: E8,
      employee_id: 'EMP008',
      first_name: 'Pooja',
      last_name: 'Desai',
      email: 'emp2.beta@company.com',
      phone: '+91-9000000008',
      date_of_birth: '1998-12-05',
      gender: 'female',
      blood_group: 'O+',
      address: '8 Employee Street',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411003',
      country: 'India',
      pan: 'HHHCY8901M',
      aadhar: '8888-9999-0000',
      department_id: HR,
      designation_id: D_EXEC,
      reporting_manager_id: E3,
      date_of_joining: '2023-01-15',
      employment_type: 'permanent',
      status: 'active',
    },

    // ── IT Admin ──────────────────────────────────────────────────────────────
    {
      id: E9,
      employee_id: 'EMP009',
      first_name: 'Vikram',
      last_name: 'Nair',
      email: 'it@company.com',
      phone: '+91-9000000009',
      date_of_birth: '1990-03-22',
      gender: 'male',
      blood_group: 'B+',
      address: '9 IT Street',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560001',
      country: 'India',
      pan: 'IIICZ9012N',
      aadhar: '9999-0000-1111',
      department_id: IT,
      designation_id: D_IT,
      reporting_manager_id: E1,
      date_of_joining: '2021-02-01',
      employment_type: 'permanent',
      status: 'active',
    },
  ]);

  console.log('Employees seeded (9): 1 super admin + 2 HR managers + 5 employees + 1 IT admin');
}
