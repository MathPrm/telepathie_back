import app from './app';
import pool from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Base de données prête');
    client.release();

    app.listen(port, () => {
      console.log(`🚀 Serveur démarré avec succès sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();