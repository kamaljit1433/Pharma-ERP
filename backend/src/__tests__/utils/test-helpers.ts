import { Knex } from 'knex';
import { testDb } from './test-db';
import { FactoryBuilder } from '../factories/factory-builder';

/**
 * Test helpers for setting up and tearing down test environment
 */
export class TestHelpers {
  private knex: Knex | null = null;
  private factoryBuilder: FactoryBuilder | null = null;

  /**
   * Initialize test environment
   */
  async setup(): Promise<void> {
    // Initialize database
    this.knex = await testDb.initialize();

    // Run migrations
    await testDb.migrate();

    // Initialize factory builder
    this.factoryBuilder = new FactoryBuilder(this.knex);
  }

  /**
   * Clean up test environment
   */
  async teardown(): Promise<void> {
    // Clean all tables
    await testDb.cleanTables();

    // Close database connection
    await testDb.close();

    this.knex = null;
    this.factoryBuilder = null;
  }

  /**
   * Get knex instance
   */
  getKnex(): Knex {
    if (!this.knex) {
      throw new Error('Test environment not initialized. Call setup() first.');
    }
    return this.knex;
  }

  /**
   * Get factory builder
   */
  getFactories(): FactoryBuilder {
    if (!this.factoryBuilder) {
      throw new Error('Test environment not initialized. Call setup() first.');
    }
    return this.factoryBuilder;
  }

  /**
   * Reset database (clean all tables)
   */
  async reset(): Promise<void> {
    await testDb.cleanTables();
  }

  /**
   * Execute raw SQL query
   */
  async query<T = any>(sql: string, bindings?: any[]): Promise<T[]> {
    const result = await this.getKnex().raw(sql, bindings);
    return result.rows || result;
  }

  /**
   * Insert raw data
   */
  async insert(table: string, data: any): Promise<any> {
    const result = await this.getKnex()(table).insert(data).returning('*');
    return result[0];
  }

  /**
   * Get data from table
   */
  async get(table: string, where?: any): Promise<any[]> {
    let query = this.getKnex()(table);
    if (where) {
      query = query.where(where);
    }
    return query;
  }

  /**
   * Get single record from table
   */
  async getOne(table: string, where?: any): Promise<any> {
    let query = this.getKnex()(table);
    if (where) {
      query = query.where(where);
    }
    return query.first();
  }

  /**
   * Count records in table
   */
  async count(table: string, where?: any): Promise<number> {
    let query = this.getKnex()(table);
    if (where) {
      query = query.where(where);
    }
    const result = await query.count('* as count').first();
    return result?.count || 0;
  }

  /**
   * Delete records from table
   */
  async delete(table: string, where?: any): Promise<number> {
    let query = this.getKnex()(table);
    if (where) {
      query = query.where(where);
    }
    return query.del();
  }

  /**
   * Update records in table
   */
  async update(table: string, data: any, where?: any): Promise<number> {
    let query = this.getKnex()(table);
    if (where) {
      query = query.where(where);
    }
    return query.update(data);
  }
}

/**
 * Create a test helpers instance
 */
export function createTestHelpers(): TestHelpers {
  return new TestHelpers();
}
