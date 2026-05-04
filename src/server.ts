import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {

    app.listen(port, () => {
      console.log(`🚀 Serveur démarré avec succès sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();