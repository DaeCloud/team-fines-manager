"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
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
      body: JSON.stringify({ type: "admin", username, password }),
    });

    if (res.ok) {
      // Hard navigate so the browser sends the freshly-set cookie
      // before middleware evaluates the /admin route
      window.location.href = "/admin";
    } else {
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, var(--bg-base) 60%)`,
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <ShieldCheck size={36} style={{ color: "#60a5fa" }} />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Admin Login
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            For administrators only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-5">
          <div>
            <label className="label">Username</label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
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
                placeholder="Password"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "var(--accent-hot)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200"
            style={{
              fontFamily: "var(--font-display)",
              background: "rgba(59,130,246,0.8)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          <Link href="/login" style={{ color: "var(--accent-primary)" }} className="hover:underline">
            ← Back to team login
          </Link>
        </p>
      </div>
    </div>
  );
}
