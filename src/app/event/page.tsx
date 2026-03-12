"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Fine } from "@/types";
import { Beer, CheckCircle, ArrowRightLeft, Users, Wifi, WifiOff } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";
import Link from "next/link";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("fines_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("fines_session_id", id);
  }
  return id;
}

export default function EventPage() {
  const [eventActive, setEventActive] = useState(false);
  const [currentFine, setCurrentFine] = useState<Fine | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [myVote, setMyVote] = useState<"accept" | "reverse" | null>(null);
  const [voteCounts, setVoteCounts] = useState({ accept: 0, reverse: 0, total: 0 });
  const [connected, setConnected] = useState(false);
  const [finalized, setFinalized] = useState<{ status: string; fine: Fine } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  const loadState = useCallback(async () => {
    const res = await fetch("/api/event");
    const data = await res.json();
    setEventActive(data.eventActive);
    setCurrentFine(data.currentFine);
    setPendingCount(data.pendingCount);
    setMyVote(null);
    setFinalized(null);

    if (data.currentFine) {
      const votesRes = await fetch(`/api/votes?fineId=${data.currentFine.id}`);
      const votesData = await votesRes.json();
      setVoteCounts({
        accept: votesData.acceptCount,
        reverse: votesData.reverseCount,
        total: votesData.votes?.length || 0,
      });
    } else {
      setVoteCounts({ accept: 0, reverse: 0, total: 0 });
    }
  }, []);

  useEffect(() => {
    loadState();

    const socket = io({ path: "/api/socket", addTrailingSlash: false });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("event:started", (data: { currentFine: Fine | null }) => {
      setEventActive(true);
      setCurrentFine(data.currentFine);
      setMyVote(null);
      setFinalized(null);
      setVoteCounts({ accept: 0, reverse: 0, total: 0 });
    });

    socket.on("event:ended", () => {
      setEventActive(false);
      setCurrentFine(null);
      setMyVote(null);
      setFinalized(null);
      setVoteCounts({ accept: 0, reverse: 0, total: 0 });
    });

    socket.on("event:newFine", (fine: Fine | null) => {
      setCurrentFine(fine);
      setMyVote(null);
      setFinalized(null);
      setVoteCounts({ accept: 0, reverse: 0, total: 0 });
    });

    socket.on("event:voteUpdate", (data: { fineId: number; acceptCount: number; reverseCount: number; totalVotes: number }) => {
      setVoteCounts({ accept: data.acceptCount, reverse: data.reverseCount, total: data.totalVotes });
    });

    socket.on("event:finalized", (data: { fine: Fine; status: string }) => {
      setFinalized(data);
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitVote = async (vote: "accept" | "reverse") => {
    if (!currentFine || myVote) return;
    setMyVote(vote);
    await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fineId: currentFine.id, sessionId, vote }),
    });
  };

  const totalVotes = voteCounts.accept + voteCounts.reverse;
  const acceptPct = totalVotes > 0 ? Math.round((voteCounts.accept / totalVotes) * 100) : 50;
  const reversePct = 100 - acceptPct;

  return (
    <AuthGuard>
      <div className="min-h-screen event-bg flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-primary)" }}>
              <Beer size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Event Night 🍺
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {eventActive && (
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{pendingCount}</span> remaining
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: connected ? "var(--accent-green)" : "var(--text-muted)" }}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? "Live" : "Connecting..."}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex items-center justify-center p-6">
          {/* Waiting for event to start */}
          {!eventActive && (
            <div className="text-center animate-fade-in">
              <div className="text-7xl mb-6">🍺</div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Waiting for the event to start
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Sit tight — the admin will kick things off shortly...
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-primary)", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Event active - finalized state */}
          {eventActive && finalized && (
            <div className="text-center animate-bounce-in max-w-lg">
              <div className="text-8xl mb-6">{finalized.status === "accepted" ? "🍺" : "🔄"}</div>
              <h2 className="text-5xl font-bold mb-4" style={{
                fontFamily: "var(--font-display)",
                color: finalized.status === "accepted" ? "#4ade80" : "#60a5fa",
                letterSpacing: "-0.03em",
              }}>
                {finalized.status === "accepted" ? "Fine Accepted!" : "Fine Reversed!"}
              </h2>
              {finalized.status === "reversed" && finalized.fine.reversedToMember && (
                <p className="text-2xl" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>
                  Bounced to <span style={{ color: "#60a5fa", fontWeight: 700 }}>{finalized.fine.reversedToMember.name}</span>
                </p>
              )}
              <p className="mt-4" style={{ color: "var(--text-muted)" }}>Waiting for next fine...</p>
            </div>
          )}

          {/* Event active - no fine loaded yet */}
          {eventActive && !finalized && !currentFine && (
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-muted)" }}>
                Loading next fine...
              </p>
            </div>
          )}

          {/* Event active - fine displayed */}
          {eventActive && !finalized && currentFine && (
            <div className="w-full max-w-2xl">
              <div className="fine-card-event rounded-3xl p-6 md:p-8 mb-5 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} style={{ color: "var(--accent-primary)" }} />
                  <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {currentFine.fineMembers.map((fm) => fm.member.name).join(", ")}
                  </span>
                </div>
                <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  {currentFine.reason}
                </p>
                {currentFine.fineDate && (
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    📅 {format(new Date(currentFine.fineDate), "MMMM d, yyyy")}
                  </div>
                )}
              </div>

              {/* Vote buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => submitVote("accept")} disabled={!!myVote}
                    className="vote-btn-accept p-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ fontFamily: "var(--font-display)", opacity: myVote && myVote !== "accept" ? 0.4 : 1, outline: myVote === "accept" ? "2px solid #4ade80" : "none" }}>
                    <CheckCircle size={20} />
                    Accept {myVote === "accept" && "✓"}
                  </button>
                  <button onClick={() => submitVote("reverse")} disabled={!!myVote}
                    className="vote-btn-reverse p-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ fontFamily: "var(--font-display)", opacity: myVote && myVote !== "reverse" ? 0.4 : 1, outline: myVote === "reverse" ? "2px solid #60a5fa" : "none" }}>
                    <ArrowRightLeft size={20} />
                    Reverse {myVote === "reverse" && "✓"}
                  </button>
                </div>

                {/* Vote bar */}
                <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "#4ade80", fontFamily: "var(--font-display)", fontWeight: 700 }}>Accept {voteCounts.accept}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                    <span style={{ color: "#f87171", fontFamily: "var(--font-display)", fontWeight: 700 }}>{voteCounts.reverse} Reverse</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "var(--bg-elevated)" }}>
                    <div className="h-full transition-all duration-500 rounded-l-full" style={{ width: `${acceptPct}%`, background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
                    <div className="h-full transition-all duration-500 rounded-r-full" style={{ width: `${reversePct}%`, background: "linear-gradient(90deg, #dc2626, #ef4444)" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
