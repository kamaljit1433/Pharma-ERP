import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create salary_structures table
  await knex.schema.createTable('salary_structures', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('salary_mode', ['monthly', 'daily', 'hourly']).notNullable().defaultTo('monthly');
    table.decimal('base_salary', 15, 2).notNullable();
    table.decimal('hra', 15, 2).notNullable().defaultTo(0);
    table.decimal('dearness_allowance', 15, 2).notNullable().defaultTo(0);
    table.decimal('other_allowances', 15, 2).notNullable().defaultTo(0);
    table.decimal('pf_contribution_rate', 5, 2).notNullable().defaultTo(12);
    table.decimal('esi_contribution_rate', 5, 2).notNullable().defaultTo(0.75);
    table.decimal('professional_tax', 15, 2).notNullable().defaultTo(0);
    table.jsonb('deductions').nullable();
    table.date('effective_from').notNullable();
    table.date('effective_to').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('is_active');
  });

  // Create salary_structure_revisions table
  await knex.schema.createTable('salary_structure_revisions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('salary_structure_id').notNullable().references('id').inTable('salary_structures').onDelete('CASCADE');
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.decimal('previous_salary', 15, 2).notNullable();
    table.decimal('new_salary', 15, 2).notNullable();
    table.date('effective_from').notNullable();
    table.text('reason').nullable();
    table.uuid('created_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('salary_structure_id');
  });

  // Create payroll table
  await knex.schema.createTable('payroll', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.decimal('gross_salary', 15, 2).notNullable();
    table.decimal('net_salary', 15, 2).notNullable();
    table.decimal('total_deductions', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_earnings', 15, 2).notNullable();
    table.enum('status', ['draft', 'processed', 'paid', 'locked']).notNullable().defaultTo('draft');
    table.uuid('processed_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('processed_at').nullable();
    table.timestamp('paid_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'month', 'year']);
    table.index('employee_id');
    table.index(['month', 'year']);
    table.index('status');
  });

  // Create payslips table
  await knex.schema.createTable('payslips', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('payroll_id').notNullable().references('id').inTable('payroll').onDelete('CASCADE');
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.integer('month').notNullable();
    table.integer('year').notNullable();
    table.string('payslip_number', 50).notNullable().unique();
    table.string('file_url').nullable();
    table.jsonb('earnings').nullable();
    table.jsonb('deductions').nullable();
    table.decimal('gross_salary', 15, 2).notNullable();
    table.decimal('net_salary', 15, 2).notNullable();
    table.timestamp('generated_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index(['month', 'year']);
  });

  // Create advance_salary_requests table
  await knex.schema.createTable('advance_salary_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table.text('reason').nullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'deducted']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.text('approval_notes').nullable();
    table.timestamp('approved_at').nullable();
    table.integer('deduction_months').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  console.log('Payroll tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('advance_salary_requests');
  await knex.schema.dropTableIfExists('payslips');
  await knex.schema.dropTableIfExists('payroll');
  await knex.schema.dropTableIfExists('salary_structure_revisions');
  await knex.schema.dropTableIfExists('salary_structures');
}
