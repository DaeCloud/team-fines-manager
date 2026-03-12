"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { Trophy, Beer, CheckCircle, ArrowRightLeft } from "lucide-react";

interface MemberStat {
  memberId: number;
  memberName: string;
  totalFines: number;
  pendingFines: number;
  acceptedFines: number;
  reversedFines: number;
  reversedToCount: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<MemberStat[]>([]);
  const [summary, setSummary] = useState({
    totalFines: 0,
    pendingFines: 0,
    processedFines: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.memberStats || []);
        setSummary(data.summary || {});
        setLoading(false);
      });
  }, []);

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <AuthGuard>
      <AppShell>
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 section-title">
              Leaderboard
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Hall of shame (and fame)
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Fines", value: summary.totalFines, icon: Beer, color: "var(--accent-primary)" },
              { label: "Pending", value: summary.pendingFines, icon: Trophy, color: "#fb923c" },
              { label: "Processed", value: summary.processedFines, icon: CheckCircle, color: "var(--accent-green)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <Icon size={20} className="mb-3" style={{ color }} />
                <div className="stat-number text-3xl font-bold">{value}</div>
                <div className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, idx) => (
                <div
                  key={stat.memberId}
                  className="card p-5"
                  style={{
                    border: idx < 3 ? `1px solid ${medalColors[idx]}40` : undefined,
                    background: idx === 0 ? "rgba(255,215,0,0.05)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background:
                          idx < 3
                            ? `${medalColors[idx]}20`
                            : "var(--bg-elevated)",
                        fontSize: idx < 3 ? "1.2rem" : "0.9rem",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        color: idx < 3 ? medalColors[idx] : "var(--text-muted)",
                      }}
                    >
                      {idx < 3 ? medals[idx] : `#${idx + 1}`}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <div
                        className="font-bold text-lg"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {stat.memberName}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: "var(--accent-green)" }}
                        >
                          <CheckCircle size={11} />
                          {stat.acceptedFines} accepted
                        </span>
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: "#60a5fa" }}
                        >
                          <ArrowRightLeft size={11} />
                          {stat.reversedFines} reversed
                        </span>
                        {stat.reversedToCount > 0 && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--accent-hot)" }}
                          >
                            🎯 {stat.reversedToCount} bounced back
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <div
                        className="stat-number text-3xl font-bold"
                      >
                        {stat.totalFines}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                      >
                        total fines
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {stats[0]?.totalFines > 0 && (
                    <div
                      className="mt-3 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(stat.totalFines / stats[0].totalFines) * 100}%`,
                          background:
                            idx === 0
                              ? "var(--accent-primary)"
                              : idx < 3
                              ? medalColors[idx]
                              : "var(--text-muted)",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {stats.length === 0 && (
                <div className="card p-16 text-center">
                  <Trophy
                    size={48}
                    className="mx-auto mb-4 opacity-20"
                    style={{ color: "var(--accent-primary)" }}
                  />
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-muted)" }}
                  >
                    No data yet. Add some team members!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
