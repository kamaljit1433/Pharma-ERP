import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('shifts').del();

  await knex('shifts').insert([
    {
      id: '00000001-0000-0000-0000-000000000001',
      name: 'Morning Shift',
      type: 'fixed',
      start_time: '09:00:00',
      end_time: '18:00:00',
      duration_minutes: 540,
      days_of_week: 'Mon,Tue,Wed,Thu,Fri',
      break_duration_minutes: 60,
      is_active: true,
    },
    {
      id: '00000001-0000-0000-0000-000000000002',
      name: 'Night Shift',
      type: 'fixed',
      start_time: '22:00:00',
      end_time: '06:00:00',
      duration_minutes: 480,
      days_of_week: 'Mon,Tue,Wed,Thu,Fri',
      break_duration_minutes: 30,
      is_active: true,
    },
    {
      id: '00000001-0000-0000-0000-000000000003',
      name: 'Flexible Shift',
      type: 'flexible',
      start_time: '10:00:00',
      end_time: '19:00:00',
      duration_minutes: 540,
      days_of_week: 'Mon,Tue,Wed,Thu,Fri',
      break_duration_minutes: 60,
      is_active: true,
    },
  ]);

  console.log('Shifts seeded successfully');
}
