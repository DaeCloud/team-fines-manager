import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTeamOrAdminAuth } from "@/lib/middleware";

export const GET = withTeamOrAdminAuth(async (_req: NextRequest) => {
  const setting = await prisma.setting.findFirst();
  const eventActive = setting?.eventActive ?? false;

  // Always return real pending count so admin page can enable Start button
  const pendingCount = await prisma.fine.count({ where: { status: "pending" } });

  if (!eventActive) {
    return NextResponse.json({ eventActive: false, currentFine: null, pendingCount });
  }

  let currentFine = null;
  if (setting?.eventCurrentFineId) {
    currentFine = await prisma.fine.findFirst({
      where: { id: setting.eventCurrentFineId, status: "pending" },
      include: {
        fineMembers: { include: { member: true } },
        reversedToMember: true,
        votes: true,
      },
    });
  }

  return NextResponse.json({ eventActive: true, currentFine, pendingCount });
});
