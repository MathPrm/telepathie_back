import { Pool } from 'pg';

const { DB_USER, DB_HOST, DB_NAME, POSTGRES_PASSWORD, DB_PORT } = process.env;

if (!DB_USER || !DB_HOST || !DB_NAME || !POSTGRES_PASSWORD) {
  throw new Error('Variables de base de données manquantes');
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: POSTGRES_PASSWORD,
  port: Number(DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client PostgreSQL', err);
});

export default pool;