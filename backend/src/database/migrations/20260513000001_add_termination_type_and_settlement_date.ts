import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('terminations', (table) => {
    table
      .enum('termination_type', ['voluntary', 'involuntary', 'retirement', 'contract_end'])
      .notNullable()
      .defaultTo('involuntary');
    table.date('final_settlement_date').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('terminations', (table) => {
    table.dropColumn('termination_type');
    table.dropColumn('final_settlement_date');
  });
}
