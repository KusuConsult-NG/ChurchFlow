import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, withCors } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  const user = (req as any).user;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id }, include: { organization:true }});
  res.json({ user: { id:user.id, email:user.email, fullName:user.fullName }, memberships });
}
