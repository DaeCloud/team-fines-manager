"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Key, Check, X } from "lucide-react";

export default function AdminSettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ globalPassword: newPassword }),
    });

    if (res.ok) {
      setSuccess(true);
      setNewPassword("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Failed to update password");
    }
    setLoading(false);
  };

  return (
    <AuthGuard requireAdmin>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 section-title">
            Settings
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Configure your team instance
          </p>
        </div>

        <div className="max-w-lg">
          <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Key size={20} style={{ color: "var(--accent-primary)" }} />
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Team Password
              </h2>
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New team password..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password..."
                className="input-field"
                required
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

            {success && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  color: "#4ade80",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <Check size={14} />
                Password updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
