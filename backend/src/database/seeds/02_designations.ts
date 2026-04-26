import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('designations').del();

  // Insert seed entries (using new schema: name, description, level)
  const designations = [
    // Executive Level
    {
      id: 'd1111111-1111-1111-1111-111111111111',
      name: 'Chief Executive Officer',
      description: 'Top executive responsible for overall company operations and strategy',
      level: 'Executive',
    },
    {
      id: 'd1111111-1111-1111-1111-111111111112',
      name: 'Chief Operating Officer',
      description: 'Executive responsible for day-to-day operations',
      level: 'Executive',
    },
    {
      id: 'd1111111-1111-1111-1111-111111111113',
      name: 'Chief Financial Officer',
      description: 'Executive responsible for financial planning and management',
      level: 'Executive',
    },

    // Director Level
    {
      id: 'd2222222-2222-2222-2222-222222222221',
      name: 'HR Director',
      description: 'Director of Human Resources department',
      level: 'Director',
    },
    {
      id: 'd3333333-3333-3333-3333-333333333331',
      name: 'Finance Director',
      description: 'Director of Finance and Accounting department',
      level: 'Director',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444441',
      name: 'IT Director',
      description: 'Director of Information Technology department',
      level: 'Director',
    },
    {
      id: 'd5555555-5555-5555-5555-555555555551',
      name: 'Sales Director',
      description: 'Director of Sales and Marketing department',
      level: 'Director',
    },
    {
      id: 'd6666666-6666-6666-6666-666666666661',
      name: 'Operations Director',
      description: 'Director of Operations department',
      level: 'Director',
    },
    {
      id: 'd8888888-8888-8888-8888-888888888881',
      name: 'R&D Director',
      description: 'Director of Research and Development department',
      level: 'Director',
    },

    // Manager Level
    {
      id: 'd2222222-2222-2222-2222-222222222222',
      name: 'HR Manager',
      description: 'Manager of HR operations and employee relations',
      level: 'Manager',
    },
    {
      id: 'd3333333-3333-3333-3333-333333333332',
      name: 'Finance Manager',
      description: 'Manager of financial operations and reporting',
      level: 'Manager',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444442',
      name: 'Engineering Manager',
      description: 'Manager of software engineering teams',
      level: 'Manager',
    },
    {
      id: 'd5555555-5555-5555-5555-555555555552',
      name: 'Sales Manager',
      description: 'Manager of sales operations and team',
      level: 'Manager',
    },
    {
      id: 'd5555555-5555-5555-5555-555555555555',
      name: 'Marketing Manager',
      description: 'Manager of marketing campaigns and strategy',
      level: 'Manager',
    },
    {
      id: 'd6666666-6666-6666-6666-666666666662',
      name: 'Operations Manager',
      description: 'Manager of operational processes',
      level: 'Manager',
    },
    {
      id: 'd7777777-7777-7777-7777-777777777771',
      name: 'Support Manager',
      description: 'Manager of customer support team',
      level: 'Manager',
    },
    {
      id: 'd8888888-8888-8888-8888-888888888882',
      name: 'Research Manager',
      description: 'Manager of research projects and team',
      level: 'Manager',
    },

    // Senior Level
    {
      id: 'd2222222-2222-2222-2222-222222222223',
      name: 'HR Executive',
      description: 'Senior HR professional handling employee matters',
      level: 'Senior',
    },
    {
      id: 'd2222222-2222-2222-2222-222222222224',
      name: 'Recruitment Specialist',
      description: 'Specialist in talent acquisition and recruitment',
      level: 'Senior',
    },
    {
      id: 'd3333333-3333-3333-3333-333333333333',
      name: 'Senior Accountant',
      description: 'Senior accounting professional',
      level: 'Senior',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444443',
      name: 'Senior Software Engineer',
      description: 'Experienced software engineer with technical leadership',
      level: 'Senior',
    },
    {
      id: 'd5555555-5555-5555-5555-555555555553',
      name: 'Senior Sales Executive',
      description: 'Experienced sales professional',
      level: 'Senior',
    },
    {
      id: 'd6666666-6666-6666-6666-666666666663',
      name: 'Operations Executive',
      description: 'Senior operations professional',
      level: 'Senior',
    },
    {
      id: 'd7777777-7777-7777-7777-777777777772',
      name: 'Senior Support Engineer',
      description: 'Experienced customer support engineer',
      level: 'Senior',
    },
    {
      id: 'd8888888-8888-8888-8888-888888888883',
      name: 'Senior Research Engineer',
      description: 'Experienced research engineer',
      level: 'Senior',
    },

    // Mid Level
    {
      id: 'd3333333-3333-3333-3333-333333333334',
      name: 'Accountant',
      description: 'Mid-level accounting professional',
      level: 'Mid',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444444',
      name: 'Software Engineer',
      description: 'Mid-level software engineer',
      level: 'Mid',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444446',
      name: 'DevOps Engineer',
      description: 'DevOps engineer managing infrastructure and deployments',
      level: 'Mid',
    },
    {
      id: 'd4444444-4444-4444-4444-444444444447',
      name: 'QA Engineer',
      description: 'Quality assurance engineer',
      level: 'Mid',
    },
    {
      id: 'd5555555-5555-5555-5555-555555555554',
      name: 'Sales Executive',
      description: 'Mid-level sales professional',
      level: 'Mid',
    },
    {
      id: 'd7777777-7777-7777-7777-777777777773',
      name: 'Support Engineer',
      description: 'Mid-level customer support engineer',
      level: 'Mid',
    },
    {
      id: 'd8888888-8888-8888-8888-888888888884',
      name: 'Research Engineer',
      description: 'Mid-level research engineer',
      level: 'Mid',
    },

    // Junior Level
    {
      id: 'd4444444-4444-4444-4444-444444444445',
      name: 'Junior Software Engineer',
      description: 'Entry-level software engineer',
      level: 'Junior',
    },
  ];

  await knex('designations').insert(designations);
  console.log('Designations seeded successfully');
}
