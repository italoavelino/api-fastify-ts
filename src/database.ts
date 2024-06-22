import { Knex, knex as setupKnex } from 'knex';

import { env } from './env';

const dataBaseUrl = {
  sqlite: { filename: env.DATABASE_URL },
  pg: env.DATABASE_URL,
};

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: dataBaseUrl[env.DATABASE_CLIENT],
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
};

export const knex = setupKnex(config);
