import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  const { globalPassword } = await req.json();

  if (!globalPassword) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const hash = await hashPassword(globalPassword);

  const existing = await prisma.setting.findFirst();
  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: { globalPasswordHash: hash },
    });
  } else {
    await prisma.setting.create({
      data: { globalPasswordHash: hash },
    });
  }

  return NextResponse.json({ success: true });
});
