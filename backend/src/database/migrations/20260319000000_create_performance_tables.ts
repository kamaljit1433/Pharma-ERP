import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create goals table
  await knex.schema.createTable('goals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('cycle_id').nullable().references('id').inTable('review_cycles').onDelete('SET NULL');
    table.string('type', 10).notNullable().defaultTo('OKR');       // 'OKR' | 'KPI'
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.decimal('target_value', 15, 4).notNullable().defaultTo(0);
    table.decimal('current_value', 15, 4).notNullable().defaultTo(0);
    table.string('unit', 50).nullable();
    table.decimal('weight', 5, 2).notNullable().defaultTo(0);      // 0–100 %
    table.date('due_date').nullable();
    table.string('status', 50).notNullable().defaultTo('On Track'); // 'On Track'|'At Risk'|'Behind'|'Completed'
    table.integer('completion_percentage').notNullable().defaultTo(0);
    table.uuid('created_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('cycle_id');
    table.index('status');
  });

  // Create goal_progress_history table
  await knex.schema.createTable('goal_progress_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('goal_id').notNullable().references('id').inTable('goals').onDelete('CASCADE');
    table.decimal('previous_value', 15, 4).notNullable().defaultTo(0);
    table.decimal('new_value', 15, 4).notNullable().defaultTo(0);
    table.integer('completion_percentage').notNullable().defaultTo(0);
    table.text('comment').nullable();
    table.uuid('recorded_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('recorded_at').defaultTo(knex.fn.now());

    table.index('goal_id');
  });

  // Create review_cycles table
  await knex.schema.createTable('review_cycles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 200).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.date('self_review_deadline').nullable();
    table.date('manager_review_deadline').nullable();
    table.date('peer_review_deadline').nullable();
    table.string('status', 20).notNullable().defaultTo('Planning'); // 'Planning'|'Active'|'Closed'|'Finalized'
    table.uuid('created_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
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
    table.string('review_type', 10).notNullable().defaultTo('Self'); // 'Self'|'Manager'|'Peer'
    table.integer('rating').nullable();                               // 1–5
    table.text('comments').nullable();
    table.string('status', 50).notNullable().defaultTo('Pending');  // 'Pending'|'Self-Assessment Complete'|'Manager Review Complete'|'Finalized'
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
    table.uuid('to_employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('from_employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('type', 20).notNullable().defaultTo('Positive');   // 'Positive'|'Constructive'|'Neutral'
    table.text('content').notNullable();
    table.boolean('is_anonymous').notNullable().defaultTo(false);
    table.string('visibility', 20).notNullable().defaultTo('Private'); // 'Private'|'Manager Only'|'Public'
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('to_employee_id');
    table.index('from_employee_id');
  });

  // Create pips table (Performance Improvement Plans)
  await knex.schema.createTable('pips', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('initiated_by').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('title', 200).notNullable().defaultTo('PIP');
    table.text('description').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.jsonb('objectives').nullable().defaultTo('[]');   // array of goal IDs
    table.jsonb('checkpoints').nullable().defaultTo('[]'); // array of check-in objects
    table.string('status', 20).notNullable().defaultTo('Active'); // 'Active'|'Completed'
    table.string('outcome_notes', 50).nullable();                  // 'Completed'|'Extended'|'Escalated'
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
  await knex.schema.dropTableIfExists('goal_progress_history');
  await knex.schema.dropTableIfExists('goals');
  await knex.schema.dropTableIfExists('review_cycles');
}
