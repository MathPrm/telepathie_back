import 'dotenv/config';
import app from './app';
import pool from './config/db';
import { ensureDatabaseSchema } from './config/initSchema';

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Base de données prête');
    client.release();

    await ensureDatabaseSchema();
    console.log('Schema vérifié (table users)');

    app.listen(port, '0.0.0.0', () => {
      console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();