import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Register ts-node for TypeScript support
require('ts-node/register');

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'] || 'employee_management_system',
      user: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'postgres',
    },
    pool: {
      min: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
      max: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'] || 'employee_management_system',
      user: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'postgres',
    },
    pool: {
      min: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
      max: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'] || 'employee_management_system',
      user: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'postgres',
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
      max: parseInt(process.env['DB_POOL_MAX'] || '20', 10),
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },

  test: {
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
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },
};

export default config;
