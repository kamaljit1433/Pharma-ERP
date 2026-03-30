import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create questionnaire_templates table
  await knex.schema.createTable('questionnaire_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.jsonb('questions').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });

  // Create resignations table
  await knex.schema.createTable('resignations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.date('resignation_date').notNullable();
    table.date('last_working_day').notNullable();
    table.text('reason').nullable();
    table.enum('status', ['pending', 'accepted', 'rejected', 'withdrawn']).notNullable().defaultTo('pending');
    table.uuid('accepted_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('accepted_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create exit_interviews table
  await knex.schema.createTable('exit_interviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('questionnaire_template_id').nullable().references('id').inTable('questionnaire_templates').onDelete('SET NULL');
    table.uuid('conducted_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('scheduled_at').nullable();
    table.timestamp('conducted_at').nullable();
    table.jsonb('questionnaire_responses').nullable();
    table.text('feedback').nullable();
    table.enum('status', ['scheduled', 'completed', 'cancelled']).notNullable().defaultTo('scheduled');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create fnf_settlements table (Full & Final)
  await knex.schema.createTable('fnf_settlements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.decimal('pending_salary', 15, 2).notNullable().defaultTo(0);
    table.decimal('leave_encashment', 15, 2).notNullable().defaultTo(0);
    table.decimal('gratuity', 15, 2).notNullable().defaultTo(0);
    table.decimal('bonus', 15, 2).notNullable().defaultTo(0);
    table.decimal('other_benefits', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_earnings', 15, 2).notNullable().defaultTo(0);
    table.decimal('advance_deduction', 15, 2).notNullable().defaultTo(0);
    table.decimal('asset_damage_deduction', 15, 2).notNullable().defaultTo(0);
    table.decimal('other_deductions', 15, 2).notNullable().defaultTo(0);
    table.decimal('total_deductions', 15, 2).notNullable().defaultTo(0);
    table.decimal('net_settlement', 15, 2).notNullable().defaultTo(0);
    table.enum('status', ['draft', 'pending_approval', 'approved', 'paid']).notNullable().defaultTo('draft');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('approved_at').nullable();
    table.timestamp('paid_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });

  // Create asset_recovery_checklists table
  await knex.schema.createTable('asset_recovery_checklists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('asset_id').notNullable().references('id').inTable('assets').onDelete('CASCADE');
    table.enum('status', ['pending', 'returned', 'damaged', 'missing']).notNullable().defaultTo('pending');
    table.decimal('damage_cost', 15, 2).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['employee_id', 'asset_id']);
    table.index('employee_id');
    table.index('status');
  });

  console.log('Separation tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('asset_recovery_checklists');
  await knex.schema.dropTableIfExists('fnf_settlements');
  await knex.schema.dropTableIfExists('exit_interviews');
  await knex.schema.dropTableIfExists('resignations');
  await knex.schema.dropTableIfExists('questionnaire_templates');
}
