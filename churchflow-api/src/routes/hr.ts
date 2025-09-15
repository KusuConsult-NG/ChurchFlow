import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { z } from 'zod';

const r = Router();

// Staff
r.get('/staff', requireAuth, async (_req, res) => {
  const items = await prisma.staff.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ items });
});

r.post('/staff', requireAuth, async (req, res) => {
  const body = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().optional(),
    role: z.string()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const item = await prisma.staff.create({ data: body.data });
  res.status(201).json({ item });
});

// Payroll
r.get('/payroll', requireAuth, async (_req, res) => {
  const items = await prisma.payroll.findMany({ orderBy: { createdAt: 'desc' }, include: { staff: true }, take: 200 });
  res.json({ items });
});

r.post('/payroll', requireAuth, async (req, res) => {
  const body = z.object({
    staffId: z.string(),
    month: z.string(),
    gross: z.coerce.number(),
    deductions: z.coerce.number().optional().default(0),
    net: z.coerce.number()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const item = await prisma.payroll.create({ data: body.data as any });
  res.status(201).json({ item });
});

export default r;
