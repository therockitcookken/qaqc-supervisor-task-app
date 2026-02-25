import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const cookieName = "session_token";
export async function hashPassword(p: string) { return bcrypt.hash(p, 10); }
export async function verifyPassword(p: string, hash: string) { return bcrypt.compare(p, hash); }

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(`${process.env.SESSION_DAYS || 14}d`).sign(secret);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.session.create({ data: { userId, tokenHash, expiresAt: new Date(Date.now() + 14 * 86400000) } });
  cookies().set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
}
export async function clearSession() {
  const token = cookies().get(cookieName)?.value;
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  cookies().delete(cookieName);
}
export async function getUserFromSession() {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await prisma.session.findFirst({ where: { tokenHash, userId: payload.userId as string, expiresAt: { gt: new Date() } }, include: { user: true } });
    return session?.user ?? null;
  } catch { return null; }
}
