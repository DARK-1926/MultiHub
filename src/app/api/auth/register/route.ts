import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, createUser, getUserByEmail, createSession } from "@/lib/db";
import { hashPassword, generateToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();

    const body = await req.json();
    const { name, email, password, phone, lc_handle, cc_handle1, cc_handle2, gfg_handle, cf_handle, github_handle } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const handles = [lc_handle, cc_handle1, cc_handle2, gfg_handle, cf_handle, github_handle].filter(Boolean);
    if (handles.length === 0) return NextResponse.json({ error: "At least one platform handle is required" }, { status: 400 });

    // ── Duplicate check ──────────────────────────────────────────────────────
    const existing = await getUserByEmail(email);
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    // ── Create user ──────────────────────────────────────────────────────────
    const password_hash = await hashPassword(password);
    const cc_handles = [cc_handle1, cc_handle2].filter(Boolean) as string[];

    const user = await createUser({
      name: name.trim(),
      email: email.trim(),
      password_hash,
      phone: phone?.trim() || undefined,
      lc_handle: lc_handle?.trim() || undefined,
      cc_handles,
      gfg_handle: gfg_handle?.trim() || undefined,
      cf_handle: cf_handle?.trim() || undefined,
      github_handle: github_handle?.trim() || undefined,
    });

    // ── Create session ───────────────────────────────────────────────────────
    const token = generateToken();
    await createSession(user.id, token);

    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[auth/register]", msg);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
