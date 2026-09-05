/**
 * RankStack — Database Layer (Neon PostgreSQL)
 * Auto-creates schema on first run.
 */

import { neon } from "@neondatabase/serverless";

// ─── Client ───────────────────────────────────────────────────────────────────

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

// ─── Schema Bootstrap ─────────────────────────────────────────────────────────

export async function ensureSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone         TEXT,
      lc_handle     TEXT,
      cc_handles    TEXT[] DEFAULT '{}',
      gfg_handle    TEXT,
      cf_handle     TEXT,
      github_handle TEXT,
      notify_email  BOOLEAN DEFAULT true,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  lc_handle: string | null;
  cc_handles: string[];
  gfg_handle: string | null;
  cf_handle: string | null;
  github_handle: string | null;
  notify_email: boolean;
  created_at: string;
};

export type PublicUser = Omit<DbUser, "password_hash">;

// ─── User Helpers ─────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  lc_handle?: string;
  cc_handles?: string[];
  gfg_handle?: string;
  cf_handle?: string;
  github_handle?: string;
}): Promise<DbUser> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, phone, lc_handle, cc_handles, gfg_handle, cf_handle, github_handle)
    VALUES (
      ${data.name},
      ${data.email.toLowerCase().trim()},
      ${data.password_hash},
      ${data.phone ?? null},
      ${data.lc_handle ?? null},
      ${data.cc_handles ?? []},
      ${data.gfg_handle ?? null},
      ${data.cf_handle ?? null},
      ${data.github_handle ?? null}
    )
    RETURNING *
  `;
  return rows[0] as DbUser;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM users ORDER BY created_at ASC`;
  return rows as DbUser[];
}

export async function updateUserHandles(
  userId: string,
  handles: {
    lc_handle?: string;
    cc_handles?: string[];
    gfg_handle?: string;
    cf_handle?: string;
    github_handle?: string;
  }
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE users SET
      lc_handle     = COALESCE(${handles.lc_handle ?? null}, lc_handle),
      cc_handles    = COALESCE(${handles.cc_handles ?? null}, cc_handles),
      gfg_handle    = COALESCE(${handles.gfg_handle ?? null}, gfg_handle),
      cf_handle     = COALESCE(${handles.cf_handle ?? null}, cf_handle),
      github_handle = COALESCE(${handles.github_handle ?? null}, github_handle)
    WHERE id = ${userId}
  `;
}

// ─── Session Helpers ──────────────────────────────────────────────────────────

export async function createSession(userId: string, token: string): Promise<void> {
  const sql = getDb();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    ON CONFLICT (token) DO NOTHING
  `;
}

export async function getUserByToken(token: string): Promise<DbUser | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function cleanExpiredSessions(): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
}
