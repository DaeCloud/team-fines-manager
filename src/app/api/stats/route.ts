import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTeamAuth } from "@/lib/middleware";

export const GET = withTeamAuth(async (_req: NextRequest) => {
  const members = await prisma.teamMember.findMany({
    where: { active: true },
    include: {
      fineMembers: {
        include: {
          fine: true,
        },
      },
      reversedTo: true,
    },
    orderBy: { name: "asc" },
  });

  const stats = members.map((member) => {
    const fines = member.fineMembers.map((fm) => fm.fine);
    return {
      memberId: member.id,
      memberName: member.name,
      totalFines: fines.length,
      pendingFines: fines.filter((f) => f.status === "pending").length,
      acceptedFines: fines.filter((f) => f.status === "accepted").length,
      reversedFines: fines.filter((f) => f.status === "reversed").length,
      reversedToCount: member.reversedTo.length,
    };
  });

  // Sort by total fines desc
  stats.sort((a, b) => b.totalFines - a.totalFines);

  const totalFines = await prisma.fine.count();
  const pendingFines = await prisma.fine.count({ where: { status: "pending" } });
  const processedFines = await prisma.fine.count({
    where: { status: { in: ["accepted", "reversed"] } },
  });

  return NextResponse.json({
    memberStats: stats,
    summary: { totalFines, pendingFines, processedFines },
  });
});
