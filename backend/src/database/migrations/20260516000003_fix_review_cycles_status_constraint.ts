import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE review_cycles DROP CONSTRAINT IF EXISTS review_cycles_status_check`);

  // Migrate any existing rows with old lowercase values
  await knex.raw(`
    UPDATE review_cycles SET status = CASE status
      WHEN 'draft'   THEN 'Planning'
      WHEN 'active'  THEN 'Active'
      WHEN 'closed'  THEN 'Closed'
      ELSE status
    END
    WHERE status IN ('draft', 'active', 'closed')
  `);

  await knex.raw(`
    ALTER TABLE review_cycles
    ADD CONSTRAINT review_cycles_status_check
    CHECK (status IN ('Planning', 'Active', 'Closed', 'Finalized'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE review_cycles DROP CONSTRAINT IF EXISTS review_cycles_status_check`);

  await knex.raw(`
    UPDATE review_cycles SET status = CASE status
      WHEN 'Planning' THEN 'draft'
      WHEN 'Active'   THEN 'active'
      WHEN 'Closed'   THEN 'closed'
      ELSE status
    END
    WHERE status IN ('Planning', 'Active', 'Closed', 'Finalized')
  `);

  await knex.raw(`
    ALTER TABLE review_cycles
    ADD CONSTRAINT review_cycles_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'closed'::text]))
  `);
}
