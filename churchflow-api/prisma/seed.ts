import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@churchflow.ng' },
    update: {},
    create: { email: 'admin@churchflow.ng', fullName: 'Admin', password, role: 'ADMIN' }
  });
  console.log('Seed complete.');
}

main().finally(()=> prisma.$disconnect());
