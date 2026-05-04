import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());

// "Hello World" test
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello World depuis l\'architecture propre Node.js !' });
});

export default app;