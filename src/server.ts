import 'dotenv/config';
import express, { Request, Response } from 'express';
import './bot'; // initialize bot

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
