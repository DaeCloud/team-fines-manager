import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  generateAdminToken,
  generateTeamSessionToken,
  validateGlobalPassword,
} from "@/lib/auth";

// Team password login
export async function POST(req: NextRequest) {
  const { type, password, username } = await req.json();

  if (type === "team") {
    const valid = await validateGlobalPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = generateTeamSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set("team_session", token, {
      httpOnly: true,
      maxAge: 86400,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  if (type === "admin") {
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const token = generateAdminToken(admin.id, admin.username);
    const response = NextResponse.json({
      success: true,
      username: admin.username,
    });
    response.cookies.set("admin_auth", token, {
      httpOnly: true,
      maxAge: 86400,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// Check auth status
export async function GET(req: NextRequest) {
  const teamToken = req.cookies.get("team_session")?.value;
  const adminToken = req.cookies.get("admin_auth")?.value;

  const { verifyTeamSessionToken, verifyAdminToken } = await import(
    "@/lib/auth"
  );

  return NextResponse.json({
    isTeamAuthed: teamToken ? verifyTeamSessionToken(teamToken) : false,
    isAdminAuthed: adminToken ? verifyAdminToken(adminToken) !== null : false,
  });
}

// Logout
export async function DELETE(req: NextRequest) {
  const { type } = await req.json().catch(() => ({ type: "team" }));
  const response = NextResponse.json({ success: true });

  if (type === "admin") {
    response.cookies.delete("admin_auth");
  } else {
    response.cookies.delete("team_session");
  }
  return response;
}
