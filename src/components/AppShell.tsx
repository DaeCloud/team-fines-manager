"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import { Menu, X } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdminAuthed))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen">

      {/* ── Mobile overlay ────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className="sidebar border-r"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
        data-open={sidebarOpen}
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg md:hidden"
          style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
        >
          <X size={18} />
        </button>

        <Nav isAdmin={isAdmin} />
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b md:hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl"
            style={{ color: "var(--text-primary)", background: "var(--bg-elevated)" }}
          >
            <Menu size={20} />
          </button>
          <Link
            href="/"
            className="font-bold text-base hover:opacity-80 transition-opacity"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Team Fines 🍺
          </Link>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
