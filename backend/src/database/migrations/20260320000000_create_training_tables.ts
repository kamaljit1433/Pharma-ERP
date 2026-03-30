import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create training_programs table
  await knex.schema.createTable('training_programs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.string('provider', 100).nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.integer('duration_hours').notNullable();
    table.enum('status', ['draft', 'active', 'completed', 'cancelled']).notNullable().defaultTo('draft');
    table.integer('max_participants').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('status');
  });

  // Create training_enrollments table
  await knex.schema.createTable('training_enrollments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('training_program_id').notNullable().references('id').inTable('training_programs').onDelete('CASCADE');
    table.enum('status', ['enrolled', 'in_progress', 'completed', 'cancelled']).notNullable().defaultTo('enrolled');
    table.date('enrollment_date').notNullable();
    table.date('completion_date').nullable();
    table.integer('score').nullable();
    table.boolean('passed').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'training_program_id']);
    table.index('employee_id');
    table.index('status');
  });

  // Create certifications table
  await knex.schema.createTable('certifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('issuing_organization', 100).notNullable();
    table.string('certificate_number', 100).nullable();
    table.date('issue_date').notNullable();
    table.date('expiry_date').nullable();
    table.string('certificate_url').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('expiry_date');
  });

  // Create skills table
  await knex.schema.createTable('skills', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('category', 50).notNullable();
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('category');
  });

  // Create employee_skills table
  await knex.schema.createTable('employee_skills', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('skill_id').notNullable().references('id').inTable('skills').onDelete('CASCADE');
    table.enum('proficiency_level', ['beginner', 'intermediate', 'advanced', 'expert']).notNullable().defaultTo('beginner');
    table.integer('years_of_experience').nullable();
    table.date('last_used_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'skill_id']);
    table.index('employee_id');
  });

  console.log('Training tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employee_skills');
  await knex.schema.dropTableIfExists('skills');
  await knex.schema.dropTableIfExists('certifications');
  await knex.schema.dropTableIfExists('training_enrollments');
  await knex.schema.dropTableIfExists('training_programs');
}
