import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('hierarchy_nodes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().unique().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('department_id').notNullable().references('id').inTable('departments').onDelete('RESTRICT');
    table.uuid('designation_id').notNullable().references('id').inTable('designations').onDelete('RESTRICT');
    table.uuid('manager_id').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.uuid('dotted_line_manager_id').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('manager_id');
    table.index('department_id');
  });

  await knex.schema.createTable('hierarchy_audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('action', ['assign', 'update', 'remove']).notNullable();
    table.jsonb('old_value').nullable();
    table.jsonb('new_value').nullable();
    table.uuid('changed_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('created_at');
  });

  await knex.schema.createTable('approval_requests', (table) => {
    table.string('id', 100).primary();
    table.enum('request_type', ['leave', 'travel', 'expense']).notNullable();
    table.string('request_id', 100).notNullable();
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.jsonb('approval_chain').notNullable();
    table.integer('current_approval_level').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
    table.index('request_id');
    table.index('request_type');
  });

  await knex.schema.createTable('approval_audit_logs', (table) => {
    table.string('id', 100).primary();
    table.string('approval_request_id', 100).notNullable().references('id').inTable('approval_requests').onDelete('CASCADE');
    table.string('action', 50).notNullable();
    table.jsonb('previous_value').nullable();
    table.jsonb('new_value').nullable();
    table.uuid('changed_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('approval_request_id');
    table.index('created_at');
  });

  console.log('Hierarchy and approval tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('approval_audit_logs');
  await knex.schema.dropTableIfExists('approval_requests');
  await knex.schema.dropTableIfExists('hierarchy_audit_logs');
  await knex.schema.dropTableIfExists('hierarchy_nodes');
}
