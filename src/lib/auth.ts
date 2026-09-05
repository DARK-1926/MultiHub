/**
 * RankStack — Auth Helpers
 * Password hashing + session token management
 * Server-only.
 */

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getUserByToken, DbUser } from "./db";

export const SESSION_COOKIE = "rankstack_token";
const SALT_ROUNDS = 12;

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session Token ────────────────────────────────────────────────────────────

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Session Resolution ───────────────────────────────────────────────────────

/** Read the session cookie and return the logged-in user, or null. */
export async function getCurrentUser(): Promise<DbUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await getUserByToken(token);
  } catch {
    return null;
  }
}

/** Like getCurrentUser but throws a redirect if not logged in. */
export async function requireUser(): Promise<DbUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
