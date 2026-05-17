import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_review_type_check`);

  // Migrate any existing rows with lowercase values to PascalCase
  await knex.raw(`
    UPDATE performance_reviews SET review_type = CASE review_type
      WHEN 'self'    THEN 'Self'
      WHEN 'manager' THEN 'Manager'
      WHEN 'peer'    THEN 'Peer'
      ELSE review_type
    END
    WHERE review_type IN ('self', 'manager', 'peer')
  `);

  await knex.raw(`
    ALTER TABLE performance_reviews
    ADD CONSTRAINT performance_reviews_review_type_check
    CHECK (review_type IN ('Self', 'Manager', 'Peer'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_review_type_check`);

  await knex.raw(`
    UPDATE performance_reviews SET review_type = CASE review_type
      WHEN 'Self'    THEN 'self'
      WHEN 'Manager' THEN 'manager'
      WHEN 'Peer'    THEN 'peer'
      ELSE review_type
    END
    WHERE review_type IN ('Self', 'Manager', 'Peer')
  `);

  await knex.raw(`
    ALTER TABLE performance_reviews
    ADD CONSTRAINT performance_reviews_review_type_check
    CHECK (review_type IN ('self', 'manager', 'peer'))
  `);
}
