"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Plus, Trash2, UserCog } from "lucide-react";
import { format } from "date-fns";

interface Admin {
  id: number;
  username: string;
  createdAt: string;
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAdmins = () =>
    fetch("/api/admin/admins")
      .then((r) => r.json())
      .then(setAdmins);

  useEffect(() => { loadAdmins(); }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setUsername("");
      setPassword("");
      loadAdmins();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to add admin");
    }
    setLoading(false);
  };

  const removeAdmin = async (id: number) => {
    if (!confirm("Remove this admin?")) return;
    await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    loadAdmins();
  };

  return (
    <AuthGuard requireAdmin>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 section-title">
            Admin Users
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage who has admin access
          </p>
        </div>

        {/* Add form */}
        <form onSubmit={addAdmin} className="card-elevated p-6 mb-6 space-y-4">
          <label className="label">Add New Admin</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input-field"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
              required
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--accent-hot)" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Admin
          </button>
        </form>

        {/* List */}
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.2)" }}
                >
                  <UserCog size={18} style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {admin.username}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Added {format(new Date(admin.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeAdmin(admin.id)}
                className="p-2 rounded-lg transition-colors hover:bg-red-900/20"
                style={{ color: "var(--accent-hot)" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
