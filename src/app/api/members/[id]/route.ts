import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";

export const PATCH = withAdminAuth(
  async (req: NextRequest, _admin, ctx) => {
    const id = parseInt(ctx?.params?.id);
    const { name, active } = await req.json();

    const member = await prisma.teamMember.update({
      where: { id },
      data: { name, active },
    });
    return NextResponse.json(member);
  }
);

export const DELETE = withAdminAuth(
  async (_req: NextRequest, _admin, ctx) => {
    const id = parseInt(ctx?.params?.id);
    // Soft delete
    await prisma.teamMember.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  }
);
