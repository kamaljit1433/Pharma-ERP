import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create leave_types table
  await knex.schema.createTable('leave_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('code', 20).notNullable().unique();
    table.integer('annual_limit').notNullable();
    table.boolean('is_paid').notNullable().defaultTo(true);
    table.boolean('requires_approval').notNullable().defaultTo(true);
    table.integer('carry_forward_limit').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });

  // Create company_holidays table
  await knex.schema.createTable('company_holidays', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.date('holiday_date').notNullable();
    table.enum('type', ['national', 'regional', 'company']).notNullable().defaultTo('national');
    table.boolean('is_optional').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('holiday_date');
    table.index('type');
  });

  // Create leave_balances table
  await knex.schema.createTable('leave_balances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('leave_type_id').notNullable().references('id').inTable('leave_types').onDelete('CASCADE');
    table.integer('year').notNullable();
    table.decimal('opening_balance', 10, 2).notNullable().defaultTo(0);
    table.decimal('used_balance', 10, 2).notNullable().defaultTo(0);
    table.decimal('carry_forward_balance', 10, 2).notNullable().defaultTo(0);
    table.decimal('available_balance', 10, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'leave_type_id', 'year']);
    table.index('employee_id');
    table.index('year');
  });

  // Create leaves table
  await knex.schema.createTable('leaves', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('leave_type_id').notNullable().references('id').inTable('leave_types').onDelete('CASCADE');
    table.date('from_date').notNullable();
    table.date('to_date').notNullable();
    table.decimal('days_count', 10, 2).notNullable();
    table.text('reason').nullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'cancelled']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.text('approval_notes').nullable();
    table.timestamp('approved_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('from_date');
    table.index('to_date');
    table.index('status');
    table.index(['employee_id', 'from_date', 'to_date']);
  });

  console.log('Leave tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('leaves');
  await knex.schema.dropTableIfExists('leave_balances');
  await knex.schema.dropTableIfExists('company_holidays');
  await knex.schema.dropTableIfExists('leave_types');
}
