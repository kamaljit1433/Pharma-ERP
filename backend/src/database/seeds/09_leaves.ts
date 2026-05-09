import { Knex } from 'knex';

const CL = '00000002-0000-0000-0000-000000000001';
const SL = '00000002-0000-0000-0000-000000000002';
const EL = '00000002-0000-0000-0000-000000000003';

const HR  = 'e0000000-0000-0000-0000-000000000002'; // Sarah Johnson (approver)
const MGR = 'e0000000-0000-0000-0000-000000000005'; // Emily Davis (approver)

export async function seed(knex: Knex): Promise<void> {
  await knex('leaves').del();

  await knex('leaves').insert([
    // ── APPROVED (past) ──────────────────────────────────────────────────────
    {
      employee_id: 'e0000000-0000-0000-0000-000000000007',
      leave_type_id: SL,
      from_date: '2026-03-10',
      to_date: '2026-03-11',
      days_count: 2,
      reason: 'Fever and cold — doctor advised rest for two days',
      status: 'approved',
      approved_by: HR,
      approval_notes: 'Approved. Get well soon.',
      approved_at: '2026-03-09 10:00:00',
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000009',
      leave_type_id: EL,
      from_date: '2026-03-16',
      to_date: '2026-03-18',
      days_count: 3,
      reason: 'Family function — sister\'s wedding in hometown',
      status: 'approved',
      approved_by: MGR,
      approval_notes: 'Approved. Enjoy the celebration.',
      approved_at: '2026-03-12 14:30:00',
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000010',
      leave_type_id: CL,
      from_date: '2026-03-24',
      to_date: '2026-03-24',
      days_count: 0.5,
      reason: 'Personal appointment in the afternoon',
      status: 'approved',
      approved_by: HR,
      approval_notes: 'Approved for half day.',
      approved_at: '2026-03-23 09:00:00',
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000006',
      leave_type_id: CL,
      from_date: '2026-04-22',
      to_date: '2026-04-22',
      days_count: 1,
      reason: 'Vehicle registration renewal at RTO',
      status: 'approved',
      approved_by: MGR,
      approval_notes: 'Approved.',
      approved_at: '2026-04-18 11:00:00',
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000010',
      leave_type_id: CL,
      from_date: '2026-04-14',
      to_date: '2026-04-15',
      days_count: 2,
      reason: 'Out-of-town client visit followed by personal day',
      status: 'approved',
      approved_by: HR,
      approval_notes: 'Approved.',
      approved_at: '2026-04-10 16:00:00',
    },

    // ── PENDING (upcoming) ───────────────────────────────────────────────────
    {
      employee_id: 'e0000000-0000-0000-0000-000000000008',
      leave_type_id: SL,
      from_date: '2026-04-28',
      to_date: '2026-04-28',
      days_count: 1,
      reason: 'Dental procedure scheduled — post-treatment recovery',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000007',
      leave_type_id: CL,
      from_date: '2026-05-05',
      to_date: '2026-05-06',
      days_count: 2,
      reason: 'Short holiday to visit parents',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000009',
      leave_type_id: CL,
      from_date: '2026-05-12',
      to_date: '2026-05-14',
      days_count: 3,
      reason: 'Annual leave — planned vacation',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000003',
      leave_type_id: EL,
      from_date: '2026-05-18',
      to_date: '2026-05-22',
      days_count: 5,
      reason: 'Long weekend getaway with family',
      status: 'pending',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },

    // ── REJECTED ─────────────────────────────────────────────────────────────
    {
      employee_id: 'e0000000-0000-0000-0000-000000000006',
      leave_type_id: EL,
      from_date: '2026-03-02',
      to_date: '2026-03-06',
      days_count: 5,
      reason: 'Planned vacation',
      status: 'rejected',
      approved_by: MGR,
      approval_notes: 'Quarter-end deliverables in progress. Please reschedule.',
      approved_at: '2026-02-28 10:00:00',
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000004',
      leave_type_id: CL,
      from_date: '2026-01-20',
      to_date: '2026-01-21',
      days_count: 2,
      reason: 'Personal work',
      status: 'rejected',
      approved_by: HR,
      approval_notes: 'Critical project milestone this week. Not approved.',
      approved_at: '2026-01-18 15:00:00',
    },

    // ── CANCELLED ────────────────────────────────────────────────────────────
    {
      employee_id: 'e0000000-0000-0000-0000-000000000005',
      leave_type_id: CL,
      from_date: '2026-02-20',
      to_date: '2026-02-21',
      days_count: 2,
      reason: 'Travel plans',
      status: 'cancelled',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },
    {
      employee_id: 'e0000000-0000-0000-0000-000000000002',
      leave_type_id: EL,
      from_date: '2026-03-23',
      to_date: '2026-03-25',
      days_count: 3,
      reason: 'Extended weekend',
      status: 'cancelled',
      approved_by: null,
      approval_notes: null,
      approved_at: null,
    },
  ]);

  console.log('Leaves seeded successfully');
}
