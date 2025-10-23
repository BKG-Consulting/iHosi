import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  console.log('🔐 Creating super admin user...\n');

  const password = await bcrypt.hash('SuperAdmin123!', 12);

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@ihosi.com' },
    update: {},
    create: {
      email: 'superadmin@ihosi.com',
      name: 'Super Administrator',
      password: password,
      role: 'SUPER_ADMIN',
      is_super_admin: true,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Super admin created successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('🔐 SUPER ADMIN CREDENTIALS');
  console.log('═══════════════════════════════════════════\n');
  console.log('📧 Email:    superadmin@ihosi.com');
  console.log('🔑 Password: SuperAdmin123!');
  console.log('🌐 Login at: http://admin.localhost:3000\n');
  console.log('═══════════════════════════════════════════\n');

  await prisma.$disconnect();
}

seedSuperAdmin().catch((e) => {
  console.error('❌ Error:', e);
  prisma.$disconnect();
  process.exit(1);
});

