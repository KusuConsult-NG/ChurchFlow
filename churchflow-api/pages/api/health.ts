import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { withCors } from '@/src/lib/auth';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok:true, db:true }); }
  catch(e:any){ res.status(500).json({ ok:false, db:false, error: e?.message || 'DB error' }); }
}
