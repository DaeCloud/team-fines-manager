import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";

export const PATCH = withAdminAuth(
  async (req: NextRequest, _admin, ctx) => {
    const id = parseInt(ctx?.params?.id);
    const { status, reversedToMemberId } = await req.json();

    const fine = await prisma.fine.update({
      where: { id },
      data: {
        status,
        reversedToMemberId: reversedToMemberId || null,
        eventProcessedAt: new Date(),
      },
      include: {
        fineMembers: { include: { member: true } },
        reversedToMember: true,
      },
    });

    return NextResponse.json(fine);
  }
);

export const DELETE = withAdminAuth(
  async (_req: NextRequest, _admin, ctx) => {
    const id = parseInt(ctx?.params?.id);
    await prisma.fine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }
);
