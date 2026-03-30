import knex, { Knex } from 'knex';
import config from './index';

// Import knexfile configuration
const knexConfigs: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
    },
    pool: {
      min: config.database.poolMin,
      max: config.database.poolMax,
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

const environment = config.env;
const knexConfig = knexConfigs[environment] || knexConfigs['development'];

if (!knexConfig) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

const knexInstance: Knex = knex(knexConfig);

export default knexInstance;

export const getKnexInstance = (): Knex => {
  return knexInstance;
};
