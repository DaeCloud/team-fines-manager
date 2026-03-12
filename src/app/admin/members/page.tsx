"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { TeamMember } from "@/types";
import { Plus, Trash2, Users } from "lucide-react";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMembers = () =>
    fetch("/api/members")
      .then((r) => r.json())
      .then(setMembers);

  useEffect(() => { loadMembers(); }, []);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    setLoading(false);
    loadMembers();
  };

  const removeMember = async (id: number) => {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    loadMembers();
  };

  return (
    <AuthGuard requireAdmin>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 section-title">
            Team Members
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {members.length} active member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Add form */}
        <form onSubmit={addMember} className="card-elevated p-6 mb-6">
          <label className="label">Add New Member</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Member name..."
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </form>

        {/* Members list */}
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="card p-12 text-center">
              <Users size={40} className="mx-auto mb-4 opacity-20" style={{ color: "var(--accent-primary)" }} />
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
                No members yet. Add your first one!
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "var(--accent-primary)",
                      color: "white",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {member.name[0].toUpperCase()}
                  </div>
                  <span
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {member.name}
                  </span>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-red-900/20"
                  style={{ color: "var(--accent-hot)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
