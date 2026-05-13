import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('reimbursement_claims', (table) => {
    table.dropForeign(['approved_by']);
    table.uuid('approved_by').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('reimbursement_claims', (table) => {
    table.dropForeign(['approved_by']);
    table
      .uuid('approved_by')
      .nullable()
      .references('id')
      .inTable('employees')
      .onDelete('SET NULL')
      .alter();
  });
}
