import { Knex } from 'knex';

const E1 = 'e0000000-0000-0000-0000-000000000001';
const E2 = 'e0000000-0000-0000-0000-000000000002';
const E3 = 'e0000000-0000-0000-0000-000000000003';
const E4 = 'e0000000-0000-0000-0000-000000000004';
const E5 = 'e0000000-0000-0000-0000-000000000005';
const E6 = 'e0000000-0000-0000-0000-000000000006';
const E7 = 'e0000000-0000-0000-0000-000000000007';
const E8 = 'e0000000-0000-0000-0000-000000000008';

export async function seed(knex: Knex): Promise<void> {
  await knex('pf_contributions').del();
  await knex('pf_accounts').del();

  await knex('pf_accounts').insert([
    { employee_id: E1, pf_number: 'PF/MH/001/001/0000001', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E2, pf_number: 'PF/MH/001/001/0000002', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E3, pf_number: 'PF/MH/001/001/0000003', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E4, pf_number: 'PF/MH/001/001/0000004', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E5, pf_number: 'PF/MH/001/001/0000005', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E6, pf_number: 'PF/MH/001/001/0000006', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E7, pf_number: 'PF/MH/001/001/0000007', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
    { employee_id: E8, pf_number: 'PF/MH/001/001/0000008', employee_contribution_rate: 12, employer_contribution_rate: 3.67, account_status: 'active', current_balance: 0 },
  ]);

  console.log('PF accounts seeded for all 8 employees');
}
