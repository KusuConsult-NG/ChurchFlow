import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { z } from 'zod';

const r = Router();

// Income
r.get('/income', requireAuth, async (req, res) => {
  const items = await prisma.income.findMany({ orderBy: { date: 'desc' }, take: 200 });
  res.json({ items });
});

r.post('/income', requireAuth, async (req, res) => {
  const body = z.object({
    source: z.string(),
    amount: z.coerce.number().positive(),
    narration: z.string().optional(),
    date: z.coerce.date().optional()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const item = await prisma.income.create({ data: { source: body.data.source, narration: body.data.narration, amount: body.data.amount, date: body.data.date } as any });
  res.status(201).json({ item });
});

// Expenditures
r.get('/expenditures', requireAuth, async (_req, res) => {
  const items = await prisma.expenditure.findMany({ orderBy: { date: 'desc' }, take: 200 });
  res.json({ items });
});

r.post('/expenditures', requireAuth, async (req, res) => {
  const body = z.object({
    title: z.string(),
    category: z.string(),
    amount: z.coerce.number().positive(),
    status: z.enum(['PENDING','APPROVED','REJECTED']).optional(),
    date: z.coerce.date().optional()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const item = await prisma.expenditure.create({ data: { title: body.data.title, category: body.data.category, amount: body.data.amount, status: body.data.status || 'PENDING', date: body.data.date } as any });
  res.status(201).json({ item });
});

export default r;
