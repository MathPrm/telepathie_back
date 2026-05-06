import pool from './db';

export const ensureDatabaseSchema = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      first_name VARCHAR(120) NOT NULL,
      last_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'patient',
      accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(32);
  `);

  await pool.query(`
    UPDATE users
    SET role = 'patient'
    WHERE role IS NULL;
  `);

  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN role SET NOT NULL;
  `);

  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'patient';
  `);
};
