/**
 * /api/notify/test
 * ─────────────────
 * Fires a real test email immediately.
 * GET /api/notify/test?secret=rankstack_cron_2026
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const html = `<!DOCTYPE html><html><body style="background:#0a0a0a;font-family:monospace;padding:40px">
  <div style="background:#111;border:2px solid #FF4D00;padding:32px;max-width:500px;margin:auto">
    <h1 style="color:#FF4D00;margin:0 0 16px">⚡ RankStack — Test Email</h1>
    <p style="color:#e0e0e0">If you're reading this, Maileroo SMTP is working correctly.</p>
    <p style="color:#aaa;font-size:13px">Sent at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
  </div>
</body></html>`;

  const result = await sendEmail("⚡ RankStack Test — Email Working!", html);

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    to: process.env.NOTIFY_TO_EMAIL,
    sentAt: new Date().toISOString(),
  });
}
