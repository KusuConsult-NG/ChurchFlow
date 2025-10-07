const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a test admin user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@churchflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@churchflow.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Create a test member user
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@churchflow.com' },
    update: {},
    create: {
      name: 'John Member',
      email: 'member@churchflow.com',
      password: hashedPassword,
      role: 'MEMBER'
    }
  });

  console.log('Admin user created:', adminUser);
  console.log('Member user created:', memberUser);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
