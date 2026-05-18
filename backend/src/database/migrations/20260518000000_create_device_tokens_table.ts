import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employee_device_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('employee_id')
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.text('token').notNullable();
    table.string('device_type').notNullable().defaultTo('web');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('last_used_at').nullable();
    table.timestamps(true, true);

    table.unique(['employee_id', 'token']);
    table.index('employee_id');
    table.index('token');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employee_device_tokens');
}
