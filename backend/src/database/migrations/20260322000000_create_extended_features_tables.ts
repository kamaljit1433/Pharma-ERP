import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create geo_logs table for GPS tracking
  await knex.schema.createTable('geo_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('accuracy', 10, 2).nullable();
    table.decimal('altitude', 10, 2).nullable();
    table.string('address', 255).nullable();
    table.enum('action', ['CheckIn', 'CheckOut', 'Journey', 'Manual']).notNullable().defaultTo('Manual');
    table.uuid('journey_id').nullable().references('id').inTable('journeys').onDelete('SET NULL');
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('created_at');
    table.index('journey_id');
  });

  // Create geo_fences table
  await knex.schema.createTable('geo_fences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('radius', 10, 2).notNullable();
    table.enum('type', ['Office', 'Site', 'Restricted', 'Custom']).notNullable().defaultTo('Custom');
    table.boolean('enabled').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('enabled');
    table.index('type');
  });

  // Create journeys table for travel tracking
  await knex.schema.createTable('journeys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.decimal('start_latitude', 10, 8).notNullable();
    table.decimal('start_longitude', 11, 8).notNullable();
    table.decimal('end_latitude', 10, 8).notNullable();
    table.decimal('end_longitude', 11, 8).notNullable();
    table.jsonb('waypoints').nullable();
    table.decimal('total_distance', 10, 2).notNullable();
    table.integer('total_duration').notNullable();
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.string('purpose', 255).nullable();
    table.decimal('travel_allowance', 10, 2).notNullable().defaultTo(0);
    table.enum('status', ['In Progress', 'Completed', 'Cancelled']).notNullable().defaultTo('In Progress');
    table.uuid('approved_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('approved_at').nullable();
    table.text('approval_notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('start_time');
    table.index('status');
  });

  // Create suppliers_buyers table
  await knex.schema.createTable('suppliers_buyers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.enum('type', ['supplier', 'buyer']).notNullable();
    table.string('contact_person', 100).nullable();
    table.string('email', 255).nullable();
    table.string('phone', 20).nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('country', 100).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('type');
  });

  // Create visits table for supplier/buyer visits
  await knex.schema.createTable('visits', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('supplier_buyer_id').notNullable().references('id').inTable('suppliers_buyers').onDelete('CASCADE');
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.timestamp('visit_date').notNullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.text('purpose').nullable();
    table.text('notes').nullable();
    table.string('document_url').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('supplier_buyer_id');
    table.index('employee_id');
    table.index('visit_date');
  });

  // Create bank_accounts table with encryption
  await knex.schema.createTable('bank_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('account_holder_name', 100).notNullable();
    table.string('bank_name', 100).notNullable();
    table.string('account_number_encrypted', 255).notNullable();
    table.string('ifsc_code', 20).notNullable();
    table.enum('account_type', ['savings', 'current', 'salary']).notNullable().defaultTo('savings');
    table.boolean('is_primary').notNullable().defaultTo(false);
    table.enum('verification_status', ['pending', 'verified', 'failed']).notNullable().defaultTo('pending');
    table.uuid('verified_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('is_primary');
  });

  // Create documents table
  await knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('document_type', 50).notNullable();
    table.string('file_name', 255).notNullable();
    table.string('file_url').notNullable();
    table.string('mime_type', 50).nullable();
    table.integer('file_size').nullable();
    table.date('issue_date').nullable();
    table.date('expiry_date').nullable();
    table.integer('version').notNullable().defaultTo(1);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('document_type');
    table.index('expiry_date');
  });

  // Create document_versions table
  await knex.schema.createTable('document_versions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.integer('version_number').notNullable();
    table.string('file_url').notNullable();
    table.uuid('uploaded_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('document_id');
    table.index('version_number');
    table.unique(['document_id', 'version_number']);
  });

  // Create document_access_logs table
  await knex.schema.createTable('document_access_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('accessed_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.enum('access_type', ['view', 'download', 'delete']).notNullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('document_id');
    table.index('accessed_by');
    table.index('created_at');
  });

  // Create esignature_requests table
  await knex.schema.createTable('esignature_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('requested_by').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.uuid('signer_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('document_title', 255).notNullable();
    table.enum('status', ['pending', 'signed', 'rejected', 'expired']).notNullable().defaultTo('pending');
    table.timestamp('expires_at').notNullable();
    table.timestamp('signed_at').nullable();
    table.string('signed_document_url').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('signer_id');
    table.index('status');
  });

  // Create esignature_events table
  await knex.schema.createTable('esignature_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('esignature_request_id').notNullable().references('id').inTable('esignature_requests').onDelete('CASCADE');
    table.enum('event_type', ['created', 'viewed', 'signed', 'rejected', 'reminder_sent', 'expired']).notNullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('esignature_request_id');
    table.index('event_type');
  });

  // Create notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'warning', 'error', 'success']).notNullable().defaultTo('info');
    table.enum('channel', ['in_app', 'email', 'push']).notNullable().defaultTo('in_app');
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('read_at').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('employee_id');
    table.index('is_read');
    table.index('created_at');
  });

  // Create notification_templates table
  await knex.schema.createTable('notification_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('subject', 255).notNullable();
    table.text('body').notNullable();
    table.enum('channel', ['in_app', 'email', 'push']).notNullable();
    table.jsonb('variables').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });

  // Create bank_account_audit_logs table
  await knex.schema.createTable('bank_account_audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('bank_account_id').notNullable().references('id').inTable('bank_accounts').onDelete('CASCADE');
    table.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.enum('action', ['create', 'update', 'delete', 'verify', 'set_primary']).notNullable();
    table.jsonb('changes').nullable();
    table.uuid('performed_by').notNullable().references('id').inTable('employees').onDelete('RESTRICT');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('bank_account_id');
    table.index('employee_id');
    table.index('created_at');
  });

  console.log('Extended features tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bank_account_audit_logs');
  await knex.schema.dropTableIfExists('notification_templates');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('esignature_events');
  await knex.schema.dropTableIfExists('esignature_requests');
  await knex.schema.dropTableIfExists('document_access_logs');
  await knex.schema.dropTableIfExists('document_versions');
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.dropTableIfExists('bank_accounts');
  await knex.schema.dropTableIfExists('visits');
  await knex.schema.dropTableIfExists('suppliers_buyers');
  await knex.schema.dropTableIfExists('journeys');
  await knex.schema.dropTableIfExists('geo_fences');
  await knex.schema.dropTableIfExists('geo_logs');
}
