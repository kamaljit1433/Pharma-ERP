import { Knex } from 'knex';

const ADMIN = 'e0000000-0000-0000-0000-000000000001';
const HR    = 'e0000000-0000-0000-0000-000000000002'; // Sarah Johnson

export async function seed(knex: Knex): Promise<void> {
  await knex('advance_salary_requests').del();

  await knex('advance_salary_requests').insert([
    // Pending – EMP007 (Jane Smith, Software Engineer)
    {
      id: 'ad000001-0000-0000-0000-000000000001',
      employee_id: 'e0000000-0000-0000-0000-000000000007',
      amount: 25000,
      reason: 'Medical emergency — hospitalisation of a family member; need funds urgently before next payday.',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
      deduction_months: 2,
      created_at: '2026-04-20 11:30:00',
      updated_at: '2026-04-20 11:30:00',
    },

    // Pending – EMP008 (Mike Johnson, Junior Software Engineer)
    {
      id: 'ad000002-0000-0000-0000-000000000002',
      employee_id: 'e0000000-0000-0000-0000-000000000008',
      amount: 15000,
      reason: 'Home appliance replacement — washing machine broke down; requesting advance to be deducted over 3 months.',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
      deduction_months: 3,
      created_at: '2026-04-22 09:15:00',
      updated_at: '2026-04-22 09:15:00',
    },

    // Approved – EMP006 (John Doe, Senior Software Engineer)
    {
      id: 'ad000003-0000-0000-0000-000000000003',
      employee_id: 'e0000000-0000-0000-0000-000000000006',
      amount: 30000,
      reason: 'House rent deposit for new accommodation — relocating closer to office.',
      status: 'approved',
      approved_by: HR,
      approval_notes: 'Approved. Deduction will begin from May 2026 payroll, spread over 3 months.',
      approved_at: '2026-04-15 14:00:00',
      deduction_months: 3,
      created_at: '2026-04-12 10:00:00',
      updated_at: '2026-04-15 14:00:00',
    },

    // Rejected – EMP009 (Sarah Williams, QA Engineer)
    {
      id: 'ad000004-0000-0000-0000-000000000004',
      employee_id: 'e0000000-0000-0000-0000-000000000009',
      amount: 50000,
      reason: 'Vehicle purchase down payment.',
      status: 'rejected',
      approved_by: ADMIN,
      approval_notes: 'Amount exceeds two months\' basic salary limit (policy cap ₹40,000). Please reapply with a revised amount.',
      approved_at: '2026-03-20 16:30:00',
      deduction_months: 5,
      created_at: '2026-03-18 13:00:00',
      updated_at: '2026-03-20 16:30:00',
    },

    // Deducted – EMP010 (David Brown, Senior Sales Executive)
    // Approved in February; deduction started from March payroll
    {
      id: 'ad000005-0000-0000-0000-000000000005',
      employee_id: 'e0000000-0000-0000-0000-000000000010',
      amount: 20000,
      reason: 'Children\'s school fee payment due before semester start.',
      status: 'deducted',
      approved_by: HR,
      approval_notes: 'Approved. Deduction of ₹10,000 per month for 2 months starting March 2026.',
      approved_at: '2026-02-25 10:00:00',
      deduction_months: 2,
      created_at: '2026-02-22 09:00:00',
      updated_at: '2026-04-05 15:00:00',
    },
  ]);

  console.log('Advance salary requests seeded: 5 records (pending ×2, approved ×1, rejected ×1, deducted ×1)');
}
