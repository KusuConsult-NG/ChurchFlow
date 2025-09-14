import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { hashPassword, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const ex = await prisma.user.findUnique({ where: { email }});
  if (ex) return res.status(409).json({ error: 'Email already registered' });
  const user = await prisma.user.create({ data: { fullName, email, password: await hashPassword(password) }});
  return res.status(201).json({ ok:true, user: { id: user.id, email: user.email, fullName: user.fullName }});
}
