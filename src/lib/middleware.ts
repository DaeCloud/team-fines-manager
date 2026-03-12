import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, verifyTeamSessionToken } from "./auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContext = any;

export function withTeamAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: AnyContext) => {
    const token = req.cookies.get("team_session")?.value;
    if (!token || !verifyTeamSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
}

export function withAdminAuth(
  handler: (
    req: NextRequest,
    admin: { userId: number; username: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx?: any
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: AnyContext) => {
    const token = req.cookies.get("admin_auth")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, admin, ctx);
  };
}

export function withTeamOrAdminAuth(
  handler: (req: NextRequest, ctx?: AnyContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: AnyContext) => {
    const teamToken  = req.cookies.get("team_session")?.value;
    const adminToken = req.cookies.get("admin_auth")?.value;
    const teamOk  = teamToken  ? verifyTeamSessionToken(teamToken)  : false;
    const adminOk = adminToken ? verifyAdminToken(adminToken) !== null : false;
    if (!teamOk && !adminOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
}
