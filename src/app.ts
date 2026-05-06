  import express, { Application, Request, Response } from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';

  dotenv.config();

  const app: Application = express();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.use(cors({
    origin: frontendUrl
  }));

  app.use(express.json());

  // "Hello World" test
  app.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello World depuis l\'architecture propre Node.js !' });
  });

  export default app;