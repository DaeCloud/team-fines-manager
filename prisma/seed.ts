import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPassword,
    },
  });

  // Create default global password
  const globalPassword = await bcrypt.hash("teampassword", 10);
  const existing = await prisma.setting.findFirst();
  if (!existing) {
    await prisma.setting.create({
      data: {
        globalPasswordHash: globalPassword,
      },
    });
  }

  // Create some team members
  const members = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  for (const name of members) {
    await prisma.teamMember.upsert({
      where: { id: members.indexOf(name) + 1 },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Seed complete");
  console.log("   Admin login: admin / admin123");
  console.log("   Team password: teampassword");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
