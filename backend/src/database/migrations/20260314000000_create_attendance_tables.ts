import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create shifts table
  await knex.schema.createTable('shifts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.enum('type', ['fixed', 'rotating', 'flexible']).notNullable().defaultTo('fixed');
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.integer('duration_minutes').notNullable();
    table.string('days_of_week', 50).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });

  // Create attendance table
  await knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('shift_id').nullable().references('id').inTable('shifts').onDelete('SET NULL');
    table.date('attendance_date').notNullable();
    table.time('check_in_time').nullable();
    table.time('check_out_time').nullable();
    table.decimal('check_in_latitude', 10, 8).nullable();
    table.decimal('check_in_longitude', 11, 8).nullable();
    table.decimal('check_out_latitude', 10, 8).nullable();
    table.decimal('check_out_longitude', 11, 8).nullable();
    table.boolean('face_detected').notNullable().defaultTo(false);
    table.integer('working_hours').nullable();
    table.integer('overtime_minutes').nullable().defaultTo(0);
    table.enum('status', ['present', 'absent', 'half_day', 'on_leave', 'holiday']).notNullable().defaultTo('absent');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('attendance_date');
    table.index(['employee_id', 'attendance_date']);
    table.index('status');
  });

  // Create face_detection_logs table
  await knex.schema.createTable('face_detection_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('attendance_id').notNullable().references('id').inTable('attendance').onDelete('CASCADE');
    table.boolean('detected').notNullable();
    table.decimal('confidence', 5, 4).nullable();
    table.timestamp('detected_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('attendance_id');
    table.index('detected_at');
  });

  // Create attendance_regularization_requests table
  await knex.schema.createTable('attendance_regularization_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('attendance_id').notNullable().references('id').inTable('attendance').onDelete('CASCADE');
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.text('reason').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.text('approval_notes').nullable();
    table.timestamp('approved_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('status');
    table.index('created_at');
  });

  console.log('Attendance tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attendance_regularization_requests');
  await knex.schema.dropTableIfExists('face_detection_logs');
  await knex.schema.dropTableIfExists('attendance');
  await knex.schema.dropTableIfExists('shifts');
}
