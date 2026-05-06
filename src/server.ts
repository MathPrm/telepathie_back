import dotenv from 'dotenv';
import app from './app';
import pool from './config/db';
import { ensureDatabaseSchema } from './config/initSchema';

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Base de donnees prete');
    client.release();

    await ensureDatabaseSchema();
    console.log('Schema verifie (table users)');

    app.listen(port, () => {
      console.log(`Serveur demarre sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erreur lors du demarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
