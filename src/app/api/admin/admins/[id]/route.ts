import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";

export const DELETE = withAdminAuth(
  async (
    _req: NextRequest,
    admin: { userId: number; username: string },
    ctx
  ) => {
    const id = parseInt(ctx?.params?.id);
    if (id === admin.userId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
);
