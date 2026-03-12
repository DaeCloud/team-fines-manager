"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Beer, Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "team", password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Wrong password. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, var(--bg-base) 60%)`,
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-pulse-glow"
            style={{ background: "var(--accent-primary)" }}
          >
            <Beer size={36} className="text-white" />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Team Fines
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Enter the team password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-5">
          <div>
            <label className="label">Team Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-center"
              style={{ color: "var(--accent-hot)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Checking..." : "Enter →"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Admin?{" "}
          <a
            href="/admin/login"
            style={{ color: "var(--accent-primary)" }}
            className="hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
