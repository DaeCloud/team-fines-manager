import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: API routes, static files, login pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/login" ||
    pathname === "/admin/login"
  ) {
    return NextResponse.next();
  }

  const teamSession = req.cookies.get("team_session")?.value;
  const adminAuth   = req.cookies.get("admin_auth")?.value;

  // Admin routes: require admin_auth cookie
  if (pathname.startsWith("/admin")) {
    if (!adminAuth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // All other routes: require team_session (or admin_auth also grants access)
  if (!teamSession && !adminAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
