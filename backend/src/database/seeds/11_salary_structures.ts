import { Knex } from 'knex';

// Salary structures effective from 2026-01-01
// IDs: 'f1000000-0000-0000-0000-00000000000N'
const structures = [
  // EMP001 – CEO
  { id: 'f1000000-0000-0000-0000-000000000001', employee_id: 'e0000000-0000-0000-0000-000000000001', base_salary: 150000, basic_salary: 150000, hra: 60000, dearness_allowance: 30000, other_allowances: 20000 },
  // EMP002 – HR Director
  { id: 'f1000000-0000-0000-0000-000000000002', employee_id: 'e0000000-0000-0000-0000-000000000002', base_salary: 80000,  basic_salary: 80000,  hra: 32000, dearness_allowance: 16000, other_allowances: 10000 },
  // EMP003 – Finance Director
  { id: 'f1000000-0000-0000-0000-000000000003', employee_id: 'e0000000-0000-0000-0000-000000000003', base_salary: 90000,  basic_salary: 90000,  hra: 36000, dearness_allowance: 18000, other_allowances: 12000 },
  // EMP004 – IT Director
  { id: 'f1000000-0000-0000-0000-000000000004', employee_id: 'e0000000-0000-0000-0000-000000000004', base_salary: 95000,  basic_salary: 95000,  hra: 38000, dearness_allowance: 19000, other_allowances: 12000 },
  // EMP005 – Engineering Manager
  { id: 'f1000000-0000-0000-0000-000000000005', employee_id: 'e0000000-0000-0000-0000-000000000005', base_salary: 75000,  basic_salary: 75000,  hra: 30000, dearness_allowance: 15000, other_allowances: 8000  },
  // EMP006 – Senior Software Engineer
  { id: 'f1000000-0000-0000-0000-000000000006', employee_id: 'e0000000-0000-0000-0000-000000000006', base_salary: 60000,  basic_salary: 60000,  hra: 24000, dearness_allowance: 12000, other_allowances: 6000  },
  // EMP007 – Software Engineer
  { id: 'f1000000-0000-0000-0000-000000000007', employee_id: 'e0000000-0000-0000-0000-000000000007', base_salary: 50000,  basic_salary: 50000,  hra: 20000, dearness_allowance: 10000, other_allowances: 5000  },
  // EMP008 – Junior Software Engineer
  { id: 'f1000000-0000-0000-0000-000000000008', employee_id: 'e0000000-0000-0000-0000-000000000008', base_salary: 40000,  basic_salary: 40000,  hra: 16000, dearness_allowance: 8000,  other_allowances: 4000  },
  // EMP009 – QA Engineer
  { id: 'f1000000-0000-0000-0000-000000000009', employee_id: 'e0000000-0000-0000-0000-000000000009', base_salary: 45000,  basic_salary: 45000,  hra: 18000, dearness_allowance: 9000,  other_allowances: 5000  },
  // EMP010 – Senior Sales Executive
  { id: 'f1000000-0000-0000-0000-000000000010', employee_id: 'e0000000-0000-0000-0000-000000000010', base_salary: 55000,  basic_salary: 55000,  hra: 22000, dearness_allowance: 11000, other_allowances: 6000  },
];

export async function seed(knex: Knex): Promise<void> {
  // Cascades to salary_structure_revisions
  await knex('salary_structures').del();

  await knex('salary_structures').insert(
    structures.map((s) => ({
      id: s.id,
      employee_id: s.employee_id,
      salary_mode: 'monthly',
      base_salary: s.base_salary,
      basic_salary: s.basic_salary,
      hra: s.hra,
      dearness_allowance: s.dearness_allowance,
      other_allowances: s.other_allowances,
      pf_contribution_rate: 12,
      pf_percentage: 12,
      esi_contribution_rate: 0.75,
      esi_percentage: 0.75,
      professional_tax: 200,
      effective_from: '2026-01-01',
      effective_to: null,
      is_active: true,
    }))
  );

  console.log('Salary structures seeded successfully');
}
