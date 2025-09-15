import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './lib/prisma.js';
import authRouter from './routes/auth.js';
import financeRouter from './routes/finance.js';
import hrRouter from './routes/hr.js';
import assetsRouter from './routes/assets.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: false }));
app.use(morgan('tiny'));

app.get('/health', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true, db: true }); }
  catch { res.status(500).json({ ok: false, db: false }); }
});

app.use('/auth', authRouter);
app.use('/finance', financeRouter);
app.use('/hr', hrRouter);
app.use('/assets', assetsRouter);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`ChurchFlow API listening on :${port}`));
