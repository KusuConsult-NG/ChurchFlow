import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { comparePassword, signToken, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  const u = await prisma.user.findUnique({ where: { email }});
  if (!u) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await comparePassword(password, u.password);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = signToken({ userId: u.id });
  res.json({ token, user: { id: u.id, email: u.email, fullName: u.fullName }});
}
