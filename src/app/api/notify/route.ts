/**
 * /api/notify
 * ────────────
 * Manual notification trigger. Called by the "NOTIFY ME" button in ContestRadar
 * and for on-demand alerts.
 *
 * POST /api/notify
 * Body: { type: "contest" | "streak" | "daily", data?: object }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  sendContestAlert,
  sendDailyReminder,
  sendStreakBreakAlert,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);
    const body = await req.json();
    const { type, data } = body as { type: string; data?: Record<string, unknown> };

    const recipient = {
      email: (data?.email as string) || user?.email || undefined,
      phone: (data?.phone as string) || user?.phone || undefined,
      userName: user?.name || undefined,
    };

    let result;

    switch (type) {
      case "contest":
        if (!data?.name || !data?.startTime || !data?.platform || !data?.url || !data?.durationSeconds) {
          return NextResponse.json({ error: "Missing contest fields" }, { status: 400 });
        }
        result = await sendContestAlert(
          {
            name: String(data.name),
            platform: String(data.platform),
            startTime: String(data.startTime),
            url: String(data.url),
            durationSeconds: Number(data.durationSeconds),
          },
          recipient
        );
        break;

      case "streak":
        result = await sendStreakBreakAlert(Number(data?.currentStreak ?? 7), recipient);
        break;

      case "daily":
        result = await sendDailyReminder({
          streak: Number(data?.streak ?? 0),
          todaySolved: Boolean(data?.todaySolved ?? false),
          totalSolved: Number(data?.totalSolved ?? 0),
          toEmail: recipient.email,
          phone: recipient.phone,
          userName: recipient.userName,
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true, type, recipientEmail: recipient.email, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
