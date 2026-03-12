import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/middleware";
import { getIO } from "@/lib/socket";

export const POST = withAdminAuth(async (req: NextRequest) => {
  const body = await req.json();
  const { action, fineId, reversedToMemberId, finalStatus } = body;

  // ── Start event ────────────────────────────────────────────────────────────
  if (action === "start") {
    const firstFine = await prisma.fine.findFirst({
      where: { status: "pending" },
      include: {
        fineMembers: { include: { member: true } },
        reversedToMember: true,
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    await upsertSetting({ eventActive: true, eventCurrentFineId: firstFine?.id ?? null });

    getIO()?.emit("event:started", { currentFine: firstFine ?? null });
    return NextResponse.json({ fine: firstFine });
  }

  // ── End event ──────────────────────────────────────────────────────────────
  if (action === "end") {
    await upsertSetting({ eventActive: false, eventCurrentFineId: null });
    getIO()?.emit("event:ended", {});
    return NextResponse.json({ success: true });
  }

  // ── Next fine ──────────────────────────────────────────────────────────────
  if (action === "next") {
    const nextFine = await prisma.fine.findFirst({
      where: { status: "pending" },
      include: {
        fineMembers: { include: { member: true } },
        reversedToMember: true,
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    await upsertSetting({ eventCurrentFineId: nextFine?.id ?? null });
    getIO()?.emit("event:newFine", nextFine ?? null);
    return NextResponse.json({ fine: nextFine });
  }

  // ── Finalize ───────────────────────────────────────────────────────────────
  if (action === "finalize" && fineId) {
    const status = finalStatus || "accepted";

    const fine = await prisma.fine.update({
      where: { id: fineId },
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

    // Clear current fine from setting
    await upsertSetting({ eventCurrentFineId: null });
    getIO()?.emit("event:finalized", { fine, status });
    return NextResponse.json(fine);
  }

  // ── Skip ───────────────────────────────────────────────────────────────────
  if (action === "skip" && fineId) {
    await prisma.fine.update({
      where: { id: fineId },
      data: { status: "skipped" },
    });

    const nextFine = await prisma.fine.findFirst({
      where: { status: "pending" },
      include: {
        fineMembers: { include: { member: true } },
        reversedToMember: true,
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    await upsertSetting({ eventCurrentFineId: nextFine?.id ?? null });
    getIO()?.emit("event:newFine", nextFine ?? null);
    return NextResponse.json({ fine: nextFine });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});

async function upsertSetting(data: { eventActive?: boolean; eventCurrentFineId?: number | null }) {
  const existing = await prisma.setting.findFirst();
  if (existing) {
    await prisma.setting.update({ where: { id: existing.id }, data });
  } else {
    await prisma.setting.create({ data: { ...data } });
  }
}
