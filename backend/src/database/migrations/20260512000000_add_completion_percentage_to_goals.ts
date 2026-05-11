import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasGoalsCol = await knex.schema.hasColumn('goals', 'completion_percentage');
  if (!hasGoalsCol) {
    await knex.schema.alterTable('goals', (table) => {
      table.integer('completion_percentage').notNullable().defaultTo(0);
    });
  }

  const hasHistoryTable = await knex.schema.hasTable('goal_progress_history');
  if (!hasHistoryTable) {
    await knex.schema.createTable('goal_progress_history', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('goal_id').notNullable().references('id').inTable('goals').onDelete('CASCADE');
      table.decimal('previous_value', 15, 4).notNullable().defaultTo(0);
      table.decimal('new_value', 15, 4).notNullable().defaultTo(0);
      table.integer('completion_percentage').notNullable().defaultTo(0);
      table.text('comment').nullable();
      table.uuid('recorded_by').nullable().references('id').inTable('employees').onDelete('SET NULL');
      table.timestamp('recorded_at').defaultTo(knex.fn.now());
      table.index('goal_id');
    });
  } else {
    const hasHistoryCol = await knex.schema.hasColumn('goal_progress_history', 'completion_percentage');
    if (!hasHistoryCol) {
      await knex.schema.alterTable('goal_progress_history', (table) => {
        table.integer('completion_percentage').notNullable().defaultTo(0);
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasGoalsCol = await knex.schema.hasColumn('goals', 'completion_percentage');
  if (hasGoalsCol) {
    await knex.schema.alterTable('goals', (table) => {
      table.dropColumn('completion_percentage');
    });
  }

  const hasHistoryCol = await knex.schema.hasColumn('goal_progress_history', 'completion_percentage');
  if (hasHistoryCol) {
    await knex.schema.alterTable('goal_progress_history', (table) => {
      table.dropColumn('completion_percentage');
    });
  }
}
