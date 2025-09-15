import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { hash, cmp, sign } from '../lib/auth.js';
import { z } from 'zod';

const r = Router();

r.post('/register', async (req, res) => {
  const body = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    role: z.enum(['ADMIN','FINANCE','HR','VIEWER']).optional()
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });

  const exists = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (exists) return res.status(409).json({ error: 'Email already exists' });

  const user = await prisma.user.create({
    data: { email: body.data.email, password: await hash(body.data.password), fullName: body.data.fullName, role: body.data.role || 'VIEWER' },
    select: { id: true, email: true, fullName: true, role: true }
  });
  res.status(201).json({ user });
});

r.post('/login', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid input' });
  const u = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await cmp(body.data.password, u.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign({ userId: u.id, role: u.role, email: u.email });
  res.json({ token, user: { id: u.id, email: u.email, fullName: u.fullName, role: u.role } });
});

export default r;
