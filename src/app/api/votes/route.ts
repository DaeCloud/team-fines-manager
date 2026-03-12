import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTeamOrAdminAuth } from "@/lib/middleware";
import { getIO } from "@/lib/socket";

export const POST = withTeamOrAdminAuth(async (req: NextRequest) => {
  const { fineId, sessionId, vote } = await req.json();

  if (!fineId || !sessionId || !vote) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Upsert vote (one vote per session per fine)
  const eventVote = await prisma.eventVote.upsert({
    where: { fineId_sessionId: { fineId, sessionId } },
    update: { vote },
    create: { fineId, sessionId, vote },
  });

  // Get vote counts
  const votes = await prisma.eventVote.findMany({ where: { fineId } });
  const acceptCount  = votes.filter((v) => v.vote === "accept").length;
  const reverseCount = votes.filter((v) => v.vote === "reverse").length;

  const io = getIO();
  io?.emit("event:voteUpdate", {
    fineId,
    acceptCount,
    reverseCount,
    totalVotes: votes.length,
  });

  return NextResponse.json({ vote: eventVote, acceptCount, reverseCount });
});

export const GET = withTeamOrAdminAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const fineId = parseInt(searchParams.get("fineId") || "0");

  if (!fineId) {
    return NextResponse.json({ error: "fineId required" }, { status: 400 });
  }

  const votes = await prisma.eventVote.findMany({ where: { fineId } });
  const acceptCount  = votes.filter((v) => v.vote === "accept").length;
  const reverseCount = votes.filter((v) => v.vote === "reverse").length;

  return NextResponse.json({ votes, acceptCount, reverseCount });
});
