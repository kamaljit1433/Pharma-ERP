import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create insurance_plans table
  await knex.schema.createTable('insurance_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('provider', 100).notNullable();
    table.text('description').nullable();
    table.decimal('premium_amount', 15, 2).notNullable();
    table.enum('coverage_type', ['health', 'life', 'disability', 'dental', 'vision']).notNullable();
    table.date('enrollment_start_date').notNullable();
    table.date('enrollment_end_date').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });

  // Create insurance_enrollments table
  await knex.schema.createTable('insurance_enrollments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('insurance_plan_id').notNullable().references('id').inTable('insurance_plans').onDelete('CASCADE');
    table.date('enrollment_date').notNullable();
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    table.enum('status', ['active', 'inactive', 'cancelled']).notNullable().defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'insurance_plan_id']);
    table.index('employee_id');
  });

  // Create reimbursement_claims table
  await knex.schema.createTable('reimbursement_claims', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('claim_type', 50).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.text('description').notNullable();
    table.string('receipt_url').nullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'paid']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.text('approval_notes').nullable();
    table.timestamp('approved_at').nullable();
    table.timestamp('paid_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create rewards table
  await knex.schema.createTable('rewards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('category', 50).notNullable();
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.uuid('awarded_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.date('awarded_date').notNullable();
    table.boolean('is_public').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('awarded_date');
  });

  // Create reward_nominations table
  await knex.schema.createTable('reward_nominations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('nominated_by').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('category', 50).notNullable();
    table.string('title', 100).notNullable();
    table.text('description').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.text('approval_notes').nullable();
    table.timestamp('approved_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
    table.index('nominated_by');
  });

  // Create pf_accounts table
  await knex.schema.createTable('pf_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('pf_account_number', 50).notNullable().unique();
    table.decimal('opening_balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('current_balance', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_contributions', 15, 2).notNullable().defaultTo(0);
    table.timestamp('last_contribution_date').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique('employee_id');
    table.index('pf_account_number');
  });

  // Create pf_contributions table
  await knex.schema.createTable('pf_contributions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.decimal('basic_salary', 15, 2).notNullable();
    table.decimal('employee_contribution', 15, 2).notNullable();
    table.decimal('employer_contribution', 15, 2).notNullable();
    table.decimal('total_contribution', 15, 2).notNullable();
    table.decimal('employee_contribution_rate', 5, 2).notNullable();
    table.decimal('employer_contribution_rate', 5, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'month', 'year']);
    table.index('employee_id');
    table.index(['year', 'month']);
  });

  // Create gratuities table
  await knex.schema.createTable('gratuities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.date('eligibility_date').notNullable();
    table.integer('years_of_service').notNullable();
    table.decimal('last_drawn_salary', 15, 2).notNullable();
    table.decimal('gratuity_amount', 15, 2).notNullable();
    table.boolean('is_eligible').notNullable();
    table.timestamp('calculation_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('calculation_date');
    table.index('is_eligible');
  });

  console.log('Benefits tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('gratuities');
  await knex.schema.dropTableIfExists('pf_contributions');
  await knex.schema.dropTableIfExists('pf_accounts');
  await knex.schema.dropTableIfExists('reward_nominations');
  await knex.schema.dropTableIfExists('rewards');
  await knex.schema.dropTableIfExists('reimbursement_claims');
  await knex.schema.dropTableIfExists('insurance_enrollments');
  await knex.schema.dropTableIfExists('insurance_plans');
}
