"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import FineCard from "@/components/FineCard";
import { Fine } from "@/types";
import { Filter, Beer } from "lucide-react";

export default function CurrentFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "skipped">("pending");
  const [loading, setLoading] = useState(true);

  const loadFines = () => {
    const status = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/fines${status}`)
      .then((r) => r.json())
      .then((data) => {
        setFines(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    loadFines();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filters: { key: "all" | "pending" | "skipped"; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "skipped", label: "Skipped" },
    { key: "all", label: "All" },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className="animate-fade-in">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 section-title">
                Current Fines
              </h1>
              <p style={{ color: "var(--text-muted)" }}>
                {fines.length} fine{fines.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            {/* Filter */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
            >
              <Filter size={14} className="ml-2" style={{ color: "var(--text-muted)" }} />
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      filter === key ? "var(--accent-primary)" : "transparent",
                    color:
                      filter === key ? "white" : "var(--text-muted)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card p-5 h-28 animate-pulse"
                  style={{ background: "var(--bg-card)" }}
                />
              ))}
            </div>
          ) : fines.length === 0 ? (
            <div className="card p-16 text-center">
              <Beer
                size={48}
                className="mx-auto mb-4 opacity-20"
                style={{ color: "var(--accent-primary)" }}
              />
              <p
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-muted)" }}
              >
                No {filter !== "all" ? filter : ""} fines! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fines.map((fine) => (
                <FineCard key={fine.id} fine={fine} />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
