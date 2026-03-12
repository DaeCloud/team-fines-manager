"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { TeamMember } from "@/types";
import { Check, X } from "lucide-react";

export default function AddFinePage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [fineDate, setFineDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then(setMembers);
  }, []);

  const toggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      setError("Select at least one member");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/fines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason,
        fineDate: fineDate || null,
        memberIds: selectedMembers,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/current-fines"), 1500);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to add fine");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center animate-bounce-in">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(34, 197, 94, 0.2)" }}
              >
                <Check size={40} style={{ color: "var(--accent-green)" }} />
              </div>
              <h2
                className="text-3xl font-bold mb-2 section-title"
              >
                Fine Added!
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Someone's getting a drink tonight 🍺
              </p>
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 section-title">
              Add a Fine
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Anonymous. Ruthless. Accurate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6">
            {/* Member selection */}
            <div>
              <label className="label">Who's getting fined?</label>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const selected = selectedMembers.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-display)",
                        background: selected
                          ? "var(--accent-primary)"
                          : "var(--bg-elevated)",
                        color: selected
                          ? "white"
                          : "var(--text-secondary)",
                        border: `1px solid ${selected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                        boxShadow: selected ? "var(--glow-sm)" : "none",
                      }}
                    >
                      {selected && <Check size={12} className="inline mr-1" />}
                      {member.name}
                    </button>
                  );
                })}
              </div>
              {members.length === 0 && (
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  No team members yet. Ask an admin to add some.
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="label">What did they do?</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the offense in glorious detail..."
                className="input-field resize-none"
                rows={4}
                required
              />
            </div>

            {/* Date (optional) */}
            <div>
              <label className="label">When did it happen? (optional)</label>
              <input
                type="date"
                value={fineDate}
                onChange={(e) => setFineDate(e.target.value)}
                className="input-field"
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "var(--accent-hot)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <X size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Submitting..." : "Submit Fine 🍺"}
            </button>
          </form>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
