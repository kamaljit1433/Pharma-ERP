import { Knex } from 'knex';

// Employee UUIDs (from 04_employees seed)
const E1 = 'e0000000-0000-0000-0000-000000000001'; // Admin User        – Super Admin
const E2 = 'e0000000-0000-0000-0000-000000000002'; // Priya Sharma      – HR Manager 1
const E3 = 'e0000000-0000-0000-0000-000000000003'; // Rahul Verma       – HR Manager 2
const E4 = 'e0000000-0000-0000-0000-000000000004'; // Anjali Mehta      – HR Executive
const E5 = 'e0000000-0000-0000-0000-000000000005'; // Ravi Kumar        – HR Executive
const E6 = 'e0000000-0000-0000-0000-000000000006'; // Sneha Patil       – HR Executive
const E7 = 'e0000000-0000-0000-0000-000000000007'; // Amit Singh        – HR Executive
const E8 = 'e0000000-0000-0000-0000-000000000008'; // Pooja Desai       – HR Executive
const E9 = 'e0000000-0000-0000-0000-000000000009'; // Vikram Nair       – IT Admin

// Salary structure UUIDs
const SS1 = 'aa000000-0000-0000-0000-000000000001';
const SS2 = 'aa000000-0000-0000-0000-000000000002';
const SS3 = 'aa000000-0000-0000-0000-000000000003';
const SS4 = 'aa000000-0000-0000-0000-000000000004';
const SS5 = 'aa000000-0000-0000-0000-000000000005';
const SS6 = 'aa000000-0000-0000-0000-000000000006';
const SS7 = 'aa000000-0000-0000-0000-000000000007';
const SS8 = 'aa000000-0000-0000-0000-000000000008';
const SS9 = 'aa000000-0000-0000-0000-000000000009';

// ESI note: applicable only when gross ≤ ₹21,000/month (ESIC threshold).
// All employees here earn above that, so ESI rate = 0 for accuracy.
// Junior executives have 0.75% set anyway to exercise the deduction flow in the UI.

export async function seed(knex: Knex): Promise<void> {
  await knex('salary_structures').del();

  await knex('salary_structures').insert([
    // ── Super Admin (₹1,20,000 base) ──────────────────────────────────────────
    {
      id: SS1,
      employee_id: E1,
      salary_mode: 'monthly',
      base_salary: 120000,
      hra:               48000,   // 40% of base
      dearness_allowance: 10000,
      other_allowances:   12000,  // travel + special
      pf_contribution_rate: 12,
      esi_contribution_rate: 0,
      professional_tax: 200,
      effective_from: '2024-01-01',
      is_active: true,
    },

    // ── HR Manager 1 – Priya Sharma (₹85,000 base) ───────────────────────────
    {
      id: SS2,
      employee_id: E2,
      salary_mode: 'monthly',
      base_salary: 85000,
      hra:               34000,
      dearness_allowance:  7000,
      other_allowances:    8000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0,
      professional_tax: 200,
      effective_from: '2024-01-01',
      is_active: true,
    },

    // ── HR Manager 2 – Rahul Verma (₹82,000 base) ────────────────────────────
    {
      id: SS3,
      employee_id: E3,
      salary_mode: 'monthly',
      base_salary: 82000,
      hra:               32800,
      dearness_allowance:  6500,
      other_allowances:    7500,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0,
      professional_tax: 200,
      effective_from: '2024-01-01',
      is_active: true,
    },

    // ── HR Executive – Anjali Mehta (₹38,000 base) ───────────────────────────
    {
      id: SS4,
      employee_id: E4,
      salary_mode: 'monthly',
      base_salary: 38000,
      hra:               15200,
      dearness_allowance:  3000,
      other_allowances:    3500,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: '2022-01-10',
      is_active: true,
    },

    // ── HR Executive – Ravi Kumar (₹36,000 base) ─────────────────────────────
    {
      id: SS5,
      employee_id: E5,
      salary_mode: 'monthly',
      base_salary: 36000,
      hra:               14400,
      dearness_allowance:  2800,
      other_allowances:    3200,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: '2022-03-15',
      is_active: true,
    },

    // ── HR Executive – Sneha Patil (₹30,000 base) ────────────────────────────
    {
      id: SS6,
      employee_id: E6,
      salary_mode: 'monthly',
      base_salary: 30000,
      hra:               12000,
      dearness_allowance:  2500,
      other_allowances:    2500,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: '2023-06-01',
      is_active: true,
    },

    // ── HR Executive – Amit Singh (₹44,000 base – most senior exec) ──────────
    {
      id: SS7,
      employee_id: E7,
      salary_mode: 'monthly',
      base_salary: 44000,
      hra:               17600,
      dearness_allowance:  3500,
      other_allowances:    4000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: '2021-07-01',
      is_active: true,
    },

    // ── HR Executive – Pooja Desai (₹28,000 base – newest) ───────────────────
    {
      id: SS8,
      employee_id: E8,
      salary_mode: 'monthly',
      base_salary: 28000,
      hra:               11200,
      dearness_allowance:  2200,
      other_allowances:    2000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: '2023-01-15',
      is_active: true,
    },

    // ── IT Admin – Vikram Nair (₹68,000 base) ────────────────────────────────
    {
      id: SS9,
      employee_id: E9,
      salary_mode: 'monthly',
      base_salary: 68000,
      hra:               27200,
      dearness_allowance:  5500,
      other_allowances:    6000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0,
      professional_tax: 200,
      effective_from: '2021-02-01',
      is_active: true,
    },
  ]);

  console.log('Salary structures seeded (9 employees)');
}
