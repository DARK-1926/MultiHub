/**
 * /api/cron/reminders
 * ────────────────────
 * Call this endpoint every hour (or every 15 min for finer resolution).
 * Handles:
 *   1. Contest 1-hour pre-alerts
 *   2. 6-hour daily reminders (fires at 6, 12, 18, 24 IST)
 *   3. Streak-break warning (fires at 21:00 IST if not solved)
 *
 * Protected by ?secret=CRON_SECRET or Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchUpcomingContests } from "@/lib/contests";
import { fetchAggregatedStats } from "@/lib/connectors";
import { getAllUsers } from "@/lib/db";
import {
  sendContestAlert,
  sendDailyReminder,
  sendStreakBreakAlert,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const querySecret = req.nextUrl.searchParams.get("secret");
  const bearerSecret = req.headers.get("authorization")?.replace("Bearer ", "");

  return querySecret === secret || bearerSecret === secret;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const log: string[] = [];

  // IST = UTC + 5:30
  const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);

  // Fetch all registered users
  const users = await getAllUsers().catch(() => []);
  const recipients = users.length > 0
    ? users.map((u) => ({
        email: u.email,
        phone: u.phone ?? undefined,
        name: u.name,
        handles: {
          leetcode: u.lc_handle ?? undefined,
          codechef: u.cc_handles?.length ? u.cc_handles : undefined,
          gfg: u.gfg_handle ?? undefined,
          codeforces: u.cf_handle ?? undefined,
          github: u.github_handle ?? undefined,
        },
      }))
    : [
        {
          email: process.env.NOTIFY_TO_EMAIL,
          phone: process.env.CALLMEBOT_PHONE,
          name: "Coder",
          handles: {},
        },
      ];

  // ── 1. Contest 1-hour pre-alerts ─────────────────────────────────────────
  try {
    const contests = await fetchUpcomingContests();
    const alertWindowMs = 60 * 60 * 1000; // 1 hour

    for (const contest of contests) {
      const startMs = new Date(contest.startTime).getTime();
      const diffMs = startMs - now.getTime();

      // Fire if between 55 min and 65 min away (±5 min window for cron jitter)
      if (diffMs >= 55 * 60 * 1000 && diffMs <= alertWindowMs + 5 * 60 * 1000) {
        for (const recipient of recipients) {
          if (!recipient.email) continue;
          const result = await sendContestAlert(contest, {
            email: recipient.email,
            phone: recipient.phone,
            userName: recipient.name,
          });
          log.push(`[Contest Alert -> ${recipient.email}] ${contest.name}: email=${result.email.ok}`);
        }
      }
    }
  } catch (err) {
    log.push(`[Contest Alert] Error: ${err}`);
  }

  // ── 2. 6-hour daily reminders (06, 12, 18, 00 IST) ──────────────────────
  const isDailyHour = [0, 6, 12, 18].includes(istHour);
  if (isDailyHour) {
    for (const recipient of recipients) {
      if (!recipient.email) continue;
      try {
        const stats = await fetchAggregatedStats(recipient.handles);
        const totalSolved = stats.totalProblemsSolved;
        const today = now.toISOString().split("T")[0];
        const todaySolved = stats.lastSyncedAt.startsWith(today);

        const streakValues = stats.platforms
          .map((p) => p.streak?.currentStreak ?? 0)
          .filter((s) => s > 0);
        const streak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

        const result = await sendDailyReminder({
          streak,
          todaySolved,
          totalSolved,
          toEmail: recipient.email,
          phone: recipient.phone,
          userName: recipient.name,
        });
        log.push(`[Daily Reminder -> ${recipient.email}] streak=${streak}: email=${result.email.ok}`);
      } catch (err) {
        log.push(`[Daily Reminder -> ${recipient.email}] Error: ${err}`);
      }
    }
  }

  // ── 3. Streak-break warning at 21:00 IST ─────────────────────────────────
  if (istHour === 21) {
    for (const recipient of recipients) {
      if (!recipient.email) continue;
      try {
        const stats = await fetchAggregatedStats(recipient.handles);
        const today = now.toISOString().split("T")[0];
        const todaySolved = stats.lastSyncedAt.startsWith(today);

        if (!todaySolved) {
          const streakValues = stats.platforms
            .map((p) => p.streak?.currentStreak ?? 0)
            .filter((s) => s > 0);
          const streak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

          if (streak > 0) {
            const result = await sendStreakBreakAlert(streak, {
              email: recipient.email,
              phone: recipient.phone,
              userName: recipient.name,
            });
            log.push(`[Streak Alert -> ${recipient.email}] streak=${streak}: email=${result.email.ok}`);
          }
        }
      } catch (err) {
        log.push(`[Streak Alert -> ${recipient.email}] Error: ${err}`);
      }
    }
  }

  if (log.length === 0) {
    log.push(`[Cron] istHour=${istHour} — no triggers matched this cycle (${recipients.length} registered users).`);
  }

  console.log("[/api/cron/reminders]", log.join(" | "));

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    istHour,
    recipientsCount: recipients.length,
    log,
  });
}
