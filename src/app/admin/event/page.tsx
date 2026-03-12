"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Fine, TeamMember } from "@/types";
import { Play, Square, SkipForward, CheckCircle, ArrowRightLeft, Users, ChevronRight, Wifi, WifiOff, Beer } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";

export default function AdminEventPage() {
  const [eventActive, setEventActive] = useState(false);
  const [currentFine, setCurrentFine] = useState<Fine | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [voteCounts, setVoteCounts] = useState({ accept: 0, reverse: 0 });
  const [reverseTo, setReverseTo] = useState<number | "">("");
  const [connected, setConnected] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const loadState = useCallback(async () => {
    const [eventRes, membersRes] = await Promise.all([fetch("/api/event"), fetch("/api/members")]);
    const event = await eventRes.json();
    const membersData = await membersRes.json();
    setEventActive(event.eventActive);
    setCurrentFine(event.currentFine);
    setPendingCount(event.pendingCount);
    setMembers(membersData);

    if (event.currentFine) {
      const votesRes = await fetch(`/api/votes?fineId=${event.currentFine.id}`);
      const votesData = await votesRes.json();
      setVoteCounts({ accept: votesData.acceptCount, reverse: votesData.reverseCount });
    }
  }, []);

  useEffect(() => {
    loadState();

    const socket = io({ path: "/api/socket", addTrailingSlash: false });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("event:voteUpdate", (data: { fineId: number; acceptCount: number; reverseCount: number }) => {
      setVoteCounts({ accept: data.acceptCount, reverse: data.reverseCount });
    });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const control = async (body: object) => {
    const res = await fetch("/api/event/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const startEvent = async () => {
    const data = await control({ action: "start" });
    setEventActive(true);
    setCurrentFine(data.fine);
    setVoteCounts({ accept: 0, reverse: 0 });
    setReverseTo("");
    await loadState();
  };

  const endEvent = async () => {
    if (!confirm("End the event? All remaining fines will stay pending.")) return;
    await control({ action: "end" });
    setEventActive(false);
    setCurrentFine(null);
  };

  const nextFine = async () => {
    const data = await control({ action: "next" });
    setCurrentFine(data.fine);
    setVoteCounts({ accept: 0, reverse: 0 });
    setReverseTo("");
    await loadState();
  };

  const skipFine = async () => {
    if (!currentFine) return;
    await control({ action: "skip", fineId: currentFine.id });
    await loadState();
    setReverseTo("");
  };

  const finalize = async (status: "accepted" | "reversed") => {
    if (!currentFine) return;
    if (status === "reversed" && !reverseTo) { alert("Select who to reverse to"); return; }
    setFinalizing(true);
    await control({ action: "finalize", fineId: currentFine.id, finalStatus: status, reversedToMemberId: status === "reversed" ? reverseTo : null });
    setFinalizing(false);
    setCurrentFine(null);
    setReverseTo("");
    await loadState();
  };

  const totalVotes = voteCounts.accept + voteCounts.reverse;
  const acceptPct = totalVotes > 0 ? Math.round((voteCounts.accept / totalVotes) * 100) : 50;

  return (
    <AuthGuard requireAdmin>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 section-title">Event Controller</h1>
            <div className="flex items-center gap-4">
              <p style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{pendingCount}</span> fines in queue
              </p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: connected ? "var(--accent-green)" : "var(--text-muted)" }}>
                {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {connected ? "Live" : "Disconnected"}
              </div>
            </div>
          </div>

          {/* Start / End buttons */}
          {!eventActive ? (
            <button onClick={startEvent} disabled={pendingCount === 0} className="btn-primary flex items-center gap-2"
              style={{ opacity: pendingCount === 0 ? 0.5 : 1 }}>
              <Play size={18} />
              Start Event
            </button>
          ) : (
            <button onClick={endEvent} className="btn-danger flex items-center gap-2">
              <Square size={18} />
              End Event
            </button>
          )}
        </div>

        {/* Not started */}
        {!eventActive && (
          <div className="card p-16 text-center">
            <Beer size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--accent-primary)" }} />
            <p className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Event not started
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              {pendingCount === 0 ? "No pending fines to process." : `Click "Start Event" to begin with ${pendingCount} fine${pendingCount !== 1 ? "s" : ""}.`}
            </p>
          </div>
        )}

        {/* Event active */}
        {eventActive && (
          <div className="space-y-5">
            {/* No fine loaded */}
            {!currentFine && (
              <div className="card p-8 text-center space-y-4">
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  {pendingCount > 0 ? "Load the next fine to continue." : "All fines processed! 🎉"}
                </p>
                {pendingCount > 0 && (
                  <button onClick={nextFine} className="btn-primary flex items-center gap-2 mx-auto">
                    <ChevronRight size={18} /> Load Next Fine
                  </button>
                )}
              </div>
            )}

            {/* Current fine */}
            {currentFine && (
              <>
                <div className="card-elevated p-6">
                  <span className="badge-pending mb-3 inline-block">Current Fine</span>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} style={{ color: "var(--accent-primary)" }} />
                    <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                      {currentFine.fineMembers.map((fm) => fm.member.name).join(", ")}
                    </span>
                  </div>
                  <p className="text-base leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{currentFine.reason}</p>
                  {currentFine.fineDate && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>📅 {format(new Date(currentFine.fineDate), "MMMM d, yyyy")}</p>
                  )}
                </div>

                {/* Live votes */}
                <div className="card p-5">
                  <h3 className="font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Live Votes</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold" style={{ color: "#4ade80", fontFamily: "var(--font-display)" }}>{voteCounts.accept}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Accept</div>
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>vs</div>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold" style={{ color: "#f87171", fontFamily: "var(--font-display)" }}>{voteCounts.reverse}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Reverse</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--bg-elevated)" }}>
                    <div className="h-full transition-all duration-500" style={{ width: `${acceptPct}%`, background: "#22c55e" }} />
                    <div className="h-full transition-all duration-500" style={{ width: `${100 - acceptPct}%`, background: "#ef4444" }} />
                  </div>
                  <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
                </div>

                {/* Actions */}
                <div className="card p-5 space-y-4">
                  <h3 className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Finalize Decision</h3>
                  <div>
                    <label className="label">Reverse to (if reversing)</label>
                    <select value={reverseTo} onChange={(e) => setReverseTo(e.target.value ? Number(e.target.value) : "")} className="input-field">
                      <option value="">Select member...</option>
                      {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => finalize("accepted")} disabled={finalizing}
                      className="py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                      style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #16a34a, #22c55e)" }}>
                      <CheckCircle size={18} /> Accept
                    </button>
                    <button onClick={() => finalize("reversed")} disabled={finalizing || !reverseTo}
                      className="py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                      style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #2563eb, #3b82f6)", opacity: !reverseTo ? 0.5 : 1 }}>
                      <ArrowRightLeft size={18} /> Reverse
                    </button>
                    <button onClick={skipFine} className="btn-ghost py-3 flex items-center justify-center gap-2">
                      <SkipForward size={18} /> Skip
                    </button>
                  </div>
                </div>

                <button onClick={nextFine} className="btn-ghost w-full flex items-center justify-center gap-2">
                  Load Next Fine <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
