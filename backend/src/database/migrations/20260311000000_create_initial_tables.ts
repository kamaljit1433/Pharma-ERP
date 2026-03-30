import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create departments table
  await knex.schema.createTable('departments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.uuid('parent_department_id').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.uuid('head_employee_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('parent_department_id');
    table.index('head_employee_id');
  });

  // Create designations table
  await knex.schema.createTable('designations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 100).notNullable();
    table.string('grade', 20).notNullable();
    table.uuid('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE');
    table.integer('level').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('department_id');
  });

  console.log('Initial tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('designations');
  await knex.schema.dropTableIfExists('departments');
}
