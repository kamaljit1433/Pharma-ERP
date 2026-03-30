import knex, { Knex } from 'knex';
import path from 'path';

/**
 * Test database utility for managing test database lifecycle
 * Handles database creation, migration, cleanup, and connection
 */
class TestDatabase {
  private knexInstance: Knex | null = null;
  private environment = 'test';

  /**
   * Initialize test database connection
   */
  async initialize(): Promise<Knex> {
    if (this.knexInstance) {
      return this.knexInstance;
    }

    const config: Knex.Config = {
      client: 'postgresql',
      connection: {
        host: process.env['TEST_DB_HOST'] || 'localhost',
        port: parseInt(process.env['TEST_DB_PORT'] || '5432', 10),
        database: process.env['TEST_DB_NAME'] || 'employee_management_system_test',
        user: process.env['TEST_DB_USER'] || 'postgres',
        password: process.env['TEST_DB_PASSWORD'] || 'postgres',
      },
      pool: {
        min: 1,
        max: 2,
      },
      migrations: {
        directory: path.join(__dirname, '../../database/migrations'),
        tableName: 'knex_migrations',
        extension: 'ts',
      },
    };

    this.knexInstance = knex(config);
    return this.knexInstance;
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    const db = await this.initialize();
    await db.migrate.latest();
  }

  /**
   * Rollback all migrations
   */
  async rollback(): Promise<void> {
    const db = await this.initialize();
    await db.migrate.rollback();
  }

  /**
   * Clean all tables (truncate) while preserving schema
   */
  async cleanTables(): Promise<void> {
    const db = await this.initialize();

    // Get all tables
    const tables = await db.raw(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'knex_migrations' 
      AND tablename != 'knex_migrations_lock'
    `);

    // Disable foreign key constraints temporarily
    await db.raw('SET session_replication_role = replica');

    // Truncate all tables
    for (const { tablename } of tables.rows) {
      await db.raw(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }

    // Re-enable foreign key constraints
    await db.raw('SET session_replication_role = default');
  }

  /**
   * Reset database: rollback, migrate, and clean
   */
  async reset(): Promise<void> {
    const db = await this.initialize();
    await db.migrate.rollback();
    await db.migrate.latest();
    await this.cleanTables();
  }

  /**
   * Get knex instance for direct queries
   */
  getKnex(): Knex {
    if (!this.knexInstance) {
      throw new Error('Test database not initialized. Call initialize() first.');
    }
    return this.knexInstance;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.knexInstance) {
      await this.knexInstance.destroy();
      this.knexInstance = null;
    }
  }
}

export const testDb = new TestDatabase();
