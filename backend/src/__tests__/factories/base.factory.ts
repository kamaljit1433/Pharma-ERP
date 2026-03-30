import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base factory class for generating test data
 * Provides common utilities for all entity factories
 */
export abstract class BaseFactory<T> {
  protected knex: Knex;
  protected tableName: string;

  constructor(knex: Knex, tableName: string) {
    this.knex = knex;
    this.tableName = tableName;
  }

  /**
   * Generate a UUID
   */
  protected generateId(): string {
    return uuidv4();
  }

  /**
   * Generate a random string
   */
  protected randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generate a random email
   */
  protected randomEmail(): string {
    return `test-${this.randomString(8)}@example.com`;
  }

  /**
   * Generate a random phone number
   */
  protected randomPhone(): string {
    return `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  }

  /**
   * Generate a random date between start and end
   */
  protected randomDate(start: Date = new Date(1990, 0, 1), end: Date = new Date()): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Create a single entity
   */
  abstract create(overrides?: Partial<T>): Promise<T>;

  /**
   * Create multiple entities
   */
  async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
    const entities: T[] = [];
    for (let i = 0; i < count; i++) {
      entities.push(await this.create(overrides));
    }
    return entities;
  }

  /**
   * Insert raw data into table
   */
  protected async insert(data: any): Promise<T> {
    const result = await this.knex(this.tableName).insert(data).returning('*');
    return result[0];
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | undefined> {
    return await this.knex(this.tableName).where('id', id).first();
  }

  /**
   * Delete all entities (for cleanup)
   */
  async deleteAll(): Promise<void> {
    await this.knex(this.tableName).del();
  }
}
