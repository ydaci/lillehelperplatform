import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const db = knex({
  client: isProd ? 'pg' : 'mysql2',
  connection: isProd
    ? process.env.DATABASE_URL // Supabase ou PostgreSQL
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
  pool: { min: 0, max: 10 },
});
