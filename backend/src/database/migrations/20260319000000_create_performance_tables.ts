import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create goals table
  await knex.schema.createTable('goals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.enum('type', ['okr', 'kpi']).notNullable().defaultTo('okr');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.integer('target_value').nullable();
    table.integer('current_value').notNullable().defaultTo(0);
    table.integer('progress_percentage').notNullable().defaultTo(0);
    table.enum('status', ['draft', 'active', 'completed', 'cancelled']).notNullable().defaultTo('draft');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create review_cycles table
  await knex.schema.createTable('review_cycles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.enum('status', ['draft', 'active', 'closed']).notNullable().defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('status');
  });

  // Create performance_reviews table
  await knex.schema.createTable('performance_reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('review_cycle_id').notNullable().references('id').inTable('review_cycles').onDelete('CASCADE');
    table.uuid('reviewer_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('review_type', ['self', 'manager', 'peer']).notNullable();
    table.integer('rating').nullable();
    table.text('comments').nullable();
    table.jsonb('competencies').nullable();
    table.enum('status', ['draft', 'submitted', 'finalized']).notNullable().defaultTo('draft');
    table.timestamp('submitted_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('review_cycle_id');
    table.index('reviewer_id');
  });

  // Create feedback table
  await knex.schema.createTable('feedback', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('from_employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.text('feedback_text').notNullable();
    table.enum('visibility', ['private', 'manager', 'public']).notNullable().defaultTo('private');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('from_employee_id');
  });

  // Create pips table (Performance Improvement Plans)
  await knex.schema.createTable('pips', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('initiated_by').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.jsonb('objectives').nullable();
    table.enum('status', ['active', 'completed', 'failed', 'cancelled']).notNullable().defaultTo('active');
    table.text('outcome_notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  console.log('Performance tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pips');
  await knex.schema.dropTableIfExists('feedback');
  await knex.schema.dropTableIfExists('performance_reviews');
  await knex.schema.dropTableIfExists('review_cycles');
  await knex.schema.dropTableIfExists('goals');
}
