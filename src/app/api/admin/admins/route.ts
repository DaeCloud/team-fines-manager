import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const admins = await prisma.adminUser.findMany({
    select: { id: true, username: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(admins);
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const { username, password } = await req.json();
  if (!username?.trim() || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const existing = await prisma.adminUser.findUnique({
    where: { username },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: { username: username.trim(), passwordHash },
    select: { id: true, username: true, createdAt: true },
  });
  return NextResponse.json(admin, { status: 201 });
});
