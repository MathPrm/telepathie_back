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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS practitioner_settings (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      specialty VARCHAR(255) NOT NULL DEFAULT '',
      appointment_types JSONB NOT NULL DEFAULT '[]'::jsonb,
      weekly_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id BIGSERIAL PRIMARY KEY,
      practitioner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      patient_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      appointment_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      appointment_type_label VARCHAR(255) NOT NULL,
      appointment_type_duration_minutes INTEGER NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'booked',
      patient_first_name VARCHAR(120) NOT NULL,
      patient_last_name VARCHAR(120) NOT NULL,
      patient_email VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT appointments_start_before_end CHECK (start_time < end_time),
      CONSTRAINT appointments_duration_positive CHECK (appointment_type_duration_minutes >= 5)
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_practitioner_slot_idx
    ON appointments (practitioner_user_id, appointment_date, start_time)
    WHERE status = 'booked';
  `);
};
