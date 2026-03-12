"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PlusCircle,
  List,
  History,
  BarChart3,
  Tv2,
  Settings,
  LogOut,
  Beer,
} from "lucide-react";
import { clsx } from "clsx";

interface NavProps {
  isAdmin?: boolean;
}

const publicLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/add-fine", label: "Add Fine", icon: PlusCircle },
  { href: "/current-fines", label: "Fines", icon: List },
  { href: "/history", label: "History", icon: History },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/event", label: "Event Screen", icon: Tv2 },
];

export default function Nav({ isAdmin }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "team" }),
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-2 mb-8 hover:opacity-80 transition-opacity">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-primary)" }}
        >
          <Beer size={20} className="text-white" />
        </div>
        <div>
          <div
            className="font-bold text-lg leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Fines
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Manager
          </div>
        </div>
      </Link>

      {/* Links */}
      <div className="flex-1 space-y-1">
        {publicLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx("nav-link", pathname === href && "active")}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div
              className="px-2 py-2 text-xs font-semibold mt-4"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </div>
            <Link
              href="/admin"
              className={clsx(
                "nav-link",
                pathname.startsWith("/admin") && "active"
              )}
            >
              <Settings size={18} />
              Admin Panel
            </Link>
          </>
        )}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="nav-link w-full text-left">
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
}
