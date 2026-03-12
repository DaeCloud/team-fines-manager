import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const SESSION_SECRET =
  process.env.GLOBAL_SESSION_SECRET || "session-secret-change-me";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAdminToken(userId: number, username: string): string {
  return jwt.sign({ userId, username, type: "admin" }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyAdminToken(
  token: string
): { userId: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      type: string;
    };
    if (decoded.type !== "admin") return null;
    return { userId: decoded.userId, username: decoded.username };
  } catch {
    return null;
  }
}

export function generateTeamSessionToken(): string {
  return jwt.sign({ type: "team", ts: Date.now() }, SESSION_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyTeamSessionToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as { type: string };
    return decoded.type === "team";
  } catch {
    return false;
  }
}

// Next.js 16: cookies() is async
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  if (!token) return false;
  return verifyAdminToken(token) !== null;
}

export async function getAdminFromCookie(): Promise<{
  userId: number;
  username: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function isTeamAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("team_session")?.value;
  if (!token) return false;
  return verifyTeamSessionToken(token);
}

export async function validateGlobalPassword(
  password: string
): Promise<boolean> {
  const setting = await prisma.setting.findFirst();
  if (!setting?.globalPasswordHash) return false;
  return comparePassword(password, setting.globalPasswordHash);
}
