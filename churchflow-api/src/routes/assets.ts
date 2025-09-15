import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { z } from 'zod';

const r = Router();

r.get('/', requireAuth, async (_req, res) => {
  const items = await prisma.asset.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ items });
});

r.post('/', requireAuth, async (req, res) => {
  const body = z.object({
    tag: z.string(),
    name: z.string(),
    category: z.string(),
    condition: z.string()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const item = await prisma.asset.create({ data: body.data });
  res.status(201).json({ item });
});

export default r;
