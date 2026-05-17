import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_status_check`);

  // Migrate existing rows from old lowercase values to the current PascalCase values
  await knex.raw(`
    UPDATE performance_reviews SET status = CASE status
      WHEN 'draft'                     THEN 'Pending'
      WHEN 'pending'                   THEN 'Pending'
      WHEN 'submitted'                 THEN 'Self-Assessment Complete'
      WHEN 'self-assessment complete'  THEN 'Self-Assessment Complete'
      WHEN 'manager review complete'   THEN 'Manager Review Complete'
      WHEN 'approved'                  THEN 'Finalized'
      WHEN 'finalized'                 THEN 'Finalized'
      ELSE status
    END
    WHERE status IN ('draft', 'pending', 'submitted', 'self-assessment complete', 'manager review complete', 'approved', 'finalized')
  `);

  await knex.raw(`
    ALTER TABLE performance_reviews
    ADD CONSTRAINT performance_reviews_status_check
    CHECK (status IN ('Pending', 'Self-Assessment Complete', 'Manager Review Complete', 'Finalized'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_status_check`);

  await knex.raw(`
    UPDATE performance_reviews SET status = CASE status
      WHEN 'Pending'                   THEN 'pending'
      WHEN 'Self-Assessment Complete'  THEN 'submitted'
      WHEN 'Manager Review Complete'   THEN 'manager review complete'
      WHEN 'Finalized'                 THEN 'finalized'
      ELSE status
    END
    WHERE status IN ('Pending', 'Self-Assessment Complete', 'Manager Review Complete', 'Finalized')
  `);

  await knex.raw(`
    ALTER TABLE performance_reviews
    ADD CONSTRAINT performance_reviews_status_check
    CHECK (status IN ('draft', 'pending', 'submitted', 'approved', 'finalized'))
  `);
}
