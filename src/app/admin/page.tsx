"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserCog, Settings, Tv2, Beer } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ members: 0, fines: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([members, statsData]) => {
      setStats({
        members: members.length,
        fines: statsData.summary?.totalFines || 0,
        pending: statsData.summary?.pendingFines || 0,
      });
    });
  }, []);

  const cards = [
    {
      title: "Team Members",
      description: "Add or remove team members",
      href: "/admin/members",
      icon: Users,
      value: stats.members,
      color: "rgba(249,115,22,0.2)",
      iconColor: "var(--accent-primary)",
    },
    {
      title: "Manage Admins",
      description: "Control admin access",
      href: "/admin/admins",
      icon: UserCog,
      value: null,
      color: "rgba(59,130,246,0.2)",
      iconColor: "#60a5fa",
    },
    {
      title: "Settings",
      description: "Update team password",
      href: "/admin/settings",
      icon: Settings,
      value: null,
      color: "rgba(168,85,247,0.2)",
      iconColor: "#c084fc",
    },
    {
      title: "Event Controller",
      description: `${stats.pending} fines ready`,
      href: "/admin/event",
      icon: Tv2,
      value: stats.pending,
      color: "rgba(34,197,94,0.2)",
      iconColor: "var(--accent-green)",
    },
  ];

  return (
    <AuthGuard requireAdmin>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Beer size={28} style={{ color: "var(--accent-primary)" }} />
            <h1
              className="text-4xl font-bold section-title"
              style={{ letterSpacing: "-0.03em" }}
            >
              Admin Panel
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Control everything from here
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map(({ title, description, href, icon: Icon, value, color, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="card p-6 group cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: color }}
              >
                <Icon size={22} style={{ color: iconColor }} />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="font-bold text-lg mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {description}
                  </div>
                </div>
                {value !== null && (
                  <div className="stat-number text-3xl font-bold">
                    {value}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
