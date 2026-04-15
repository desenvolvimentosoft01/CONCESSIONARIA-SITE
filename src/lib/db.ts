import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export async function query(sql: string, params?: any[]) {
  const result = await pool.query(sql, params);
  return result.rows;
}
