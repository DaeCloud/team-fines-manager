"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import FineCard from "@/components/FineCard";
import { Fine } from "@/types";
import { History as HistoryIcon } from "lucide-react";

export default function HistoryPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fines?status=accepted")
      .then((r) => r.json())
      .then((accepted: Fine[]) => {
        return fetch("/api/fines?status=reversed")
          .then((r) => r.json())
          .then((reversed: Fine[]) => {
            const all = [...accepted, ...reversed].sort(
              (a, b) =>
                new Date(b.eventProcessedAt || b.createdAt).getTime() -
                new Date(a.eventProcessedAt || a.createdAt).getTime()
            );
            setFines(all);
            setLoading(false);
          });
      });
  }, []);

  return (
    <AuthGuard>
      <AppShell>
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 section-title">
              History
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              {fines.length} processed fine{fines.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : fines.length === 0 ? (
            <div className="card p-16 text-center">
              <HistoryIcon
                size={48}
                className="mx-auto mb-4 opacity-20"
                style={{ color: "var(--accent-primary)" }}
              />
              <p
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-muted)" }}
              >
                No history yet. Have your first event!
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
