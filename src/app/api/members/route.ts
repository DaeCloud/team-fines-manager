import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTeamOrAdminAuth, withAdminAuth } from "@/lib/middleware";

export const GET = withTeamOrAdminAuth(async (_req: NextRequest) => {
  const members = await prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(members);
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const member = await prisma.teamMember.create({
    data: { name: name.trim() },
  });
  return NextResponse.json(member, { status: 201 });
});
