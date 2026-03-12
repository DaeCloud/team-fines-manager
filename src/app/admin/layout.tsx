"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, Users, UserCog, Settings, Tv2, LogOut, Beer, Menu, X } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: ShieldCheck, exact: true },
  { href: "/admin/members", label: "Team Members", icon: Users },
  { href: "/admin/admins", label: "Admins", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/event", label: "Event Controller", icon: Tv2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "admin" }),
    });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar border-r flex flex-col py-6 px-4"
        style={{ background: "rgba(26,17,8,0.98)", borderColor: "rgba(59,130,246,0.15)" }}
        data-open={sidebarOpen}
      >
        {/* Close button mobile */}
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg md:hidden"
          style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>
          <X size={18} />
        </button>

        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-3 px-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <ShieldCheck size={20} style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <div className="font-bold text-lg leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Admin</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Panel</div>
          </div>
        </Link>

        <div className="flex-1 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href) && pathname !== "/admin";
            const isExact = pathname === href;
            const active = exact ? isExact : isActive || isExact;
            return (
              <Link key={href} href={href}
                className={clsx("nav-link", active && "active")}
                style={active ? { color: "#60a5fa", background: "rgba(59,130,246,0.1)" } : {}}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <Link href="/" className="nav-link"><Beer size={18} />Public View</Link>
          <button onClick={handleLogout} className="nav-link w-full text-left"><LogOut size={18} />Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b md:hidden"
          style={{ background: "rgba(26,17,8,0.98)", borderColor: "rgba(59,130,246,0.15)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl"
            style={{ color: "var(--text-primary)", background: "var(--bg-elevated)" }}>
            <Menu size={20} />
          </button>
          <Link href="/admin" className="font-bold text-base hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-display)", color: "#60a5fa" }}>
            Admin Panel
          </Link>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
