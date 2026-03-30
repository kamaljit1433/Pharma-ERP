import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create employees table
  await knex.schema.createTable('employees', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('employee_id', 50).notNullable().unique();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 20).nullable();
    table.string('personal_email', 255).nullable();
    table.date('date_of_birth').nullable();
    table.enum('gender', ['male', 'female', 'other']).nullable();
    table.string('blood_group', 5).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('postal_code', 20).nullable();
    table.string('country', 100).nullable();
    table.string('pan', 20).nullable();
    table.string('aadhar', 20).nullable();
    table.uuid('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.uuid('designation_id').nullable().references('id').inTable('designations').onDelete('SET NULL');
    table.uuid('reporting_manager_id').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.date('date_of_joining').notNullable();
    table.date('date_of_exit').nullable();
    table.enum('employment_type', ['permanent', 'contract', 'temporary', 'intern']).notNullable().defaultTo('permanent');
    table.enum('status', ['active', 'on_leave', 'suspended', 'resigned', 'terminated']).notNullable().defaultTo('active');
    table.string('profile_photo_url').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('email');
    table.index('department_id');
    table.index('designation_id');
    table.index('reporting_manager_id');
    table.index('status');
    table.index('date_of_joining');
  });

  // Create emergency_contacts table
  await knex.schema.createTable('emergency_contacts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('relationship', 50).notNullable();
    table.string('phone', 20).notNullable();
    table.string('email', 255).nullable();
    table.text('address').nullable();
    table.integer('priority').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
  });

  // Create employment_history table
  await knex.schema.createTable('employment_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('designation_id').nullable().references('id').inTable('designations').onDelete('SET NULL');
    table.uuid('department_id').nullable().references('id').inTable('departments').onDelete('SET NULL');
    table.date('from_date').notNullable();
    table.date('to_date').nullable();
    table.string('reason', 255).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('from_date');
  });

  console.log('Employee tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employment_history');
  await knex.schema.dropTableIfExists('emergency_contacts');
  await knex.schema.dropTableIfExists('employees');
}
