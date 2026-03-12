#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss

echo "Seeding initial data if needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    console.log('Seeding initial admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.create({ data: { username: 'admin', passwordHash: hash } });
    const globalHash = await bcrypt.hash('teampassword', 10);
    await prisma.setting.create({ data: { globalPasswordHash: globalHash } });
    console.log('Seed complete. Admin: admin/admin123 | Team password: teampassword');
  }
  await prisma.\$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
"

echo "Starting server..."
exec node server.js
