"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import FineCard from "@/components/FineCard";
import { Fine } from "@/types";
import { Beer, Clock, CheckCircle, ArrowRightLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [recentFines, setRecentFines] = useState<Fine[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    reversed: 0,
  });

  useEffect(() => {
    fetch("/api/fines?limit=5")
      .then((r) => r.json())
      .then((fines: Fine[]) => {
        setRecentFines(fines);
        setStats({
          total: fines.length,
          pending: fines.filter((f) => f.status === "pending").length,
          accepted: fines.filter((f) => f.status === "accepted").length,
          reversed: fines.filter((f) => f.status === "reversed").length,
        });
      });

    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) {
          setStats({
            total: data.summary.totalFines,
            pending: data.summary.pendingFines,
            accepted: data.summary.processedFines,
            reversed: 0,
          });
        }
      });
  }, []);

  const statCards = [
    {
      label: "Total Fines",
      value: stats.total,
      icon: Beer,
      color: "var(--accent-primary)",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "#fb923c",
    },
    {
      label: "Processed",
      value: stats.accepted,
      icon: CheckCircle,
      color: "var(--accent-green)",
    },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-10">
            <h1
              className="text-4xl font-bold mb-2 section-title"
              style={{ letterSpacing: "-0.03em" }}
            >
              Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Track your team's finest moments 🍺
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                </div>
                <div className="stat-number text-4xl font-bold mb-1">
                  {value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <Link
              href="/add-fine"
              className="card p-6 flex items-center gap-4 cursor-pointer group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: "var(--accent-primary)" }}
              >
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <div
                  className="font-bold mb-0.5"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  Add a Fine
                </div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Catch someone slipping
                </div>
              </div>
            </Link>

            <Link
              href="/event"
              className="card p-6 flex items-center gap-4 cursor-pointer group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: "rgba(59,130,246,0.2)" }}
              >
                <ArrowRightLeft size={22} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <div
                  className="font-bold mb-0.5"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  Event Screen
                </div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Vote on tonight's fines
                </div>
              </div>
            </Link>
          </div>

          {/* Recent fines */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold section-title"
              >
                Recent Fines
              </h2>
              <Link
                href="/current-fines"
                className="text-sm"
                style={{ color: "var(--accent-primary)" }}
              >
                View all →
              </Link>
            </div>

            {recentFines.length === 0 ? (
              <div
                className="card p-12 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <Beer size={40} className="mx-auto mb-4 opacity-30" />
                <p style={{ fontFamily: "var(--font-display)" }}>
                  No fines yet. Stay sharp! 🍺
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFines.map((fine) => (
                  <FineCard key={fine.id} fine={fine} />
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
