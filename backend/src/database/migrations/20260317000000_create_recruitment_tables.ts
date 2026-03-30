import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create job_postings table
  await knex.schema.createTable('job_postings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 100).notNullable();
    table.text('description').notNullable();
    table.uuid('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE');
    table.uuid('designation_id').notNullable().references('id').inTable('designations').onDelete('CASCADE');
    table.integer('positions_count').notNullable();
    table.enum('status', ['draft', 'open', 'closed', 'on_hold']).notNullable().defaultTo('draft');
    table.date('posted_date').nullable();
    table.date('closing_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('department_id');
    table.index('status');
  });

  // Create applicants table
  await knex.schema.createTable('applicants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('job_posting_id').notNullable().references('id').inTable('job_postings').onDelete('CASCADE');
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20).notNullable();
    table.string('resume_url').nullable();
    table.text('cover_letter').nullable();
    table.enum('stage', ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).notNullable().defaultTo('applied');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('job_posting_id');
    table.index('stage');
    table.index('email');
  });

  // Create interviews table
  await knex.schema.createTable('interviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('applicant_id').notNullable().references('id').inTable('applicants').onDelete('CASCADE');
    table.uuid('interviewer_id').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.enum('type', ['phone', 'video', 'in_person']).notNullable().defaultTo('in_person');
    table.timestamp('scheduled_at').notNullable();
    table.integer('duration_minutes').notNullable().defaultTo(30);
    table.enum('status', ['scheduled', 'completed', 'cancelled', 'rescheduled']).notNullable().defaultTo('scheduled');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('applicant_id');
    table.index('scheduled_at');
    table.index('status');
  });

  // Create interview_feedback table
  await knex.schema.createTable('interview_feedback', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('interview_id').notNullable().references('id').inTable('interviews').onDelete('CASCADE');
    table.uuid('interviewer_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comments').nullable();
    table.enum('recommendation', ['hire', 'maybe', 'reject']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('interview_id');
    table.index('interviewer_id');
  });

  // Create onboarding_checklists table
  await knex.schema.createTable('onboarding_checklists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.jsonb('items').nullable();
    table.enum('status', ['pending', 'in_progress', 'completed']).notNullable().defaultTo('pending');
    table.date('target_completion_date').nullable();
    table.date('completed_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create assets table for asset tracking
  await knex.schema.createTable('assets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('asset_code', 50).notNullable().unique();
    table.string('name', 100).notNullable();
    table.string('category', 50).notNullable();
    table.uuid('assigned_to').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.date('assigned_date').nullable();
    table.enum('status', ['available', 'assigned', 'damaged', 'lost', 'returned']).notNullable().defaultTo('available');
    table.decimal('value', 15, 2).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('assigned_to');
    table.index('status');
  });

  console.log('Recruitment tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('assets');
  await knex.schema.dropTableIfExists('interview_feedback');
  await knex.schema.dropTableIfExists('interviews');
  await knex.schema.dropTableIfExists('onboarding_checklists');
  await knex.schema.dropTableIfExists('applicants');
  await knex.schema.dropTableIfExists('job_postings');
}
