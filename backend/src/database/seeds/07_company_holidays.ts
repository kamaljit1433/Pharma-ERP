import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('company_holidays').del();

  await knex('company_holidays').insert([
    { id: '00000003-0000-0000-0000-000000000001', name: "New Year's Day",         holiday_date: '2026-01-01', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000002', name: 'Republic Day',           holiday_date: '2026-01-26', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000003', name: 'Company Foundation Day', holiday_date: '2026-02-15', type: 'company',   is_optional: false },
    { id: '00000003-0000-0000-0000-000000000004', name: 'Holi',                   holiday_date: '2026-03-14', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000005', name: 'Good Friday',            holiday_date: '2026-04-03', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000006', name: 'Eid-ul-Fitr',            holiday_date: '2026-04-10', type: 'national',  is_optional: true  },
    { id: '00000003-0000-0000-0000-000000000007', name: 'Labour Day',             holiday_date: '2026-05-01', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000008', name: 'Independence Day',       holiday_date: '2026-08-15', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000009', name: 'Diwali',                 holiday_date: '2026-11-08', type: 'national',  is_optional: false },
    { id: '00000003-0000-0000-0000-000000000010', name: 'Christmas Day',          holiday_date: '2026-12-25', type: 'national',  is_optional: false },
  ]);

  console.log('Company holidays seeded successfully');
}
