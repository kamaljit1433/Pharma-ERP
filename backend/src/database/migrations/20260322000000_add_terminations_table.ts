import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('terminations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.date('termination_date').notNullable();
    table.text('reason').notNullable();
    table.enum('status', ['pending', 'approved', 'completed']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('approved_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('terminations');
}
