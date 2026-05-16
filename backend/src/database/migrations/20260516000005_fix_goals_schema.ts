import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add missing columns
  await knex.schema.alterTable('goals', (table) => {
    if (true) { // wrapped so we can use hasColumn checks below
    }
  });

  const hasCycleId = await knex.schema.hasColumn('goals', 'cycle_id');
  if (!hasCycleId) {
    await knex.schema.alterTable('goals', (table) => {
      table.uuid('cycle_id').nullable().references('id').inTable('review_cycles').onDelete('SET NULL');
    });
  }

  const hasUnit = await knex.schema.hasColumn('goals', 'unit');
  if (!hasUnit) {
    await knex.schema.alterTable('goals', (table) => {
      table.string('unit', 50).nullable();
    });
  }

  const hasWeight = await knex.schema.hasColumn('goals', 'weight');
  if (!hasWeight) {
    await knex.schema.alterTable('goals', (table) => {
      table.decimal('weight', 5, 2).notNullable().defaultTo(0);
    });
  }

  const hasDueDate = await knex.schema.hasColumn('goals', 'due_date');
  if (!hasDueDate) {
    await knex.schema.alterTable('goals', (table) => {
      table.date('due_date').nullable();
    });
  }

  // Alter target_value and current_value from integer to decimal
  await knex.raw(`ALTER TABLE goals ALTER COLUMN target_value TYPE decimal(15,4) USING target_value::decimal(15,4)`);
  await knex.raw(`ALTER TABLE goals ALTER COLUMN current_value TYPE decimal(15,4) USING current_value::decimal(15,4)`);

  // Fix status constraint: migrate old values then replace constraint
  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_status_check`);
  await knex.raw(`
    UPDATE goals SET status = CASE status
      WHEN 'draft'      THEN 'On Track'
      WHEN 'active'     THEN 'On Track'
      WHEN 'completed'  THEN 'Completed'
      WHEN 'cancelled'  THEN 'Behind'
      ELSE status
    END
    WHERE status IN ('draft', 'active', 'completed', 'cancelled')
  `);
  await knex.raw(`
    ALTER TABLE goals
    ADD CONSTRAINT goals_status_check
    CHECK (status IN ('On Track', 'At Risk', 'Behind', 'Completed'))
  `);

  // Fix type constraint: migrate old values then replace constraint
  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_type_check`);
  await knex.raw(`UPDATE goals SET type = UPPER(type) WHERE type IN ('okr', 'kpi')`);
  await knex.raw(`
    ALTER TABLE goals
    ADD CONSTRAINT goals_type_check
    CHECK (type IN ('OKR', 'KPI'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert constraints
  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_status_check`);
  await knex.raw(`
    ALTER TABLE goals
    ADD CONSTRAINT goals_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))
  `);

  await knex.raw(`ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_type_check`);
  await knex.raw(`
    ALTER TABLE goals
    ADD CONSTRAINT goals_type_check
    CHECK (type = ANY (ARRAY['okr'::text, 'kpi'::text]))
  `);

  // Drop added columns
  for (const col of ['cycle_id', 'unit', 'weight', 'due_date']) {
    const has = await knex.schema.hasColumn('goals', col);
    if (has) {
      await knex.schema.alterTable('goals', (table) => table.dropColumn(col));
    }
  }
}
