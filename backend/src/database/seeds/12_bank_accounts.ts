import { Knex } from 'knex';

const E1 = 'e0000000-0000-0000-0000-000000000001';
const E2 = 'e0000000-0000-0000-0000-000000000002';
const E3 = 'e0000000-0000-0000-0000-000000000003';
const E4 = 'e0000000-0000-0000-0000-000000000004';
const E5 = 'e0000000-0000-0000-0000-000000000005';
const E6 = 'e0000000-0000-0000-0000-000000000006';
const E7 = 'e0000000-0000-0000-0000-000000000007';
const E8 = 'e0000000-0000-0000-0000-000000000008';
const E9 = 'e0000000-0000-0000-0000-000000000009';

export async function seed(knex: Knex): Promise<void> {
  await knex('bank_accounts').del();

  await knex('bank_accounts').insert([
    {
      id: 'ba000000-0000-0000-0000-000000000001',
      employee_id: E1,
      account_holder_name: 'Admin User',
      bank_name: 'State Bank of India',
      account_number_encrypted: '10001000100001',
      ifsc_code: 'SBIN0000001',
      account_type: 'salary',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000002',
      employee_id: E2,
      account_holder_name: 'Priya Sharma',
      bank_name: 'HDFC Bank',
      account_number_encrypted: '20002000200002',
      ifsc_code: 'HDFC0000002',
      account_type: 'salary',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000003',
      employee_id: E3,
      account_holder_name: 'Rahul Verma',
      bank_name: 'ICICI Bank',
      account_number_encrypted: '30003000300003',
      ifsc_code: 'ICIC0000003',
      account_type: 'salary',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000004',
      employee_id: E4,
      account_holder_name: 'Anjali Mehta',
      bank_name: 'Axis Bank',
      account_number_encrypted: '40004000400004',
      ifsc_code: 'UTIB0000004',
      account_type: 'savings',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000005',
      employee_id: E5,
      account_holder_name: 'Ravi Kumar',
      bank_name: 'Kotak Mahindra Bank',
      account_number_encrypted: '50005000500005',
      ifsc_code: 'KKBK0000005',
      account_type: 'savings',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000006',
      employee_id: E6,
      account_holder_name: 'Sneha Patil',
      bank_name: 'Bank of Baroda',
      account_number_encrypted: '60006000600006',
      ifsc_code: 'BARB0000006',
      account_type: 'savings',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000007',
      employee_id: E7,
      account_holder_name: 'Amit Singh',
      bank_name: 'Punjab National Bank',
      account_number_encrypted: '70007000700007',
      ifsc_code: 'PUNB0000007',
      account_type: 'salary',
      is_primary: true,
      verification_status: 'verified',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000008',
      employee_id: E8,
      account_holder_name: 'Pooja Desai',
      bank_name: 'HDFC Bank',
      account_number_encrypted: '80008000800008',
      ifsc_code: 'HDFC0000008',
      account_type: 'savings',
      is_primary: true,
      verification_status: 'pending',
    },
    {
      id: 'ba000000-0000-0000-0000-000000000009',
      employee_id: E9,
      account_holder_name: 'Vikram Nair',
      bank_name: 'Canara Bank',
      account_number_encrypted: '90009000900009',
      ifsc_code: 'CNRB0000009',
      account_type: 'salary',
      is_primary: true,
      verification_status: 'verified',
    },
  ]);

  console.log('Bank accounts seeded (9 employees)');
}
