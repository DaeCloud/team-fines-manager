import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTeamAuth } from "@/lib/middleware";

export const GET = withTeamAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = status
    ? { status: status as "pending" | "accepted" | "reversed" | "skipped" }
    : {};

  const fines = await prisma.fine.findMany({
    where,
    include: {
      fineMembers: { include: { member: true } },
      reversedToMember: true,
      votes: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(fines);
});

export const POST = withTeamAuth(async (req: NextRequest) => {
  const { reason, fineDate, memberIds } = await req.json();

  if (!reason || !memberIds || memberIds.length === 0) {
    return NextResponse.json(
      { error: "Reason and members required" },
      { status: 400 }
    );
  }

  const fine = await prisma.fine.create({
    data: {
      reason,
      fineDate: fineDate ? new Date(fineDate) : null,
      fineMembers: {
        create: memberIds.map((id: number) => ({ memberId: id })),
      },
    },
    include: {
      fineMembers: { include: { member: true } },
    },
  });

  return NextResponse.json(fine, { status: 201 });
});
