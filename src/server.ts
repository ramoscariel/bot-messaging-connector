import 'dotenv/config';
import express, { Request, Response } from 'express';
import { config } from './config/config';
import './bot'; // initialize bot

const app = express();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
