"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (requireAdmin && !d.isAdminAuthed) {
          router.replace("/admin/login");
        } else if (!d.isTeamAuthed) {
          router.replace("/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace("/login"));
  }, [requireAdmin, router]);

  if (checking) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
