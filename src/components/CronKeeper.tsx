"use client";

/**
 * CronKeeper
 * ──────────
 * Invisible component that pings /api/cron/reminders every hour
 * while the dashboard tab is open.
 *
 * In production (Vercel), replace this with a real Vercel Cron job or
 * a free service like cron-job.org pointed at /api/cron/reminders?secret=...
 */

import { useEffect } from "react";

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const SECRET = "rankstack_cron_2026"; // must match CRON_SECRET in .env.local

export function CronKeeper() {
  useEffect(() => {
    const ping = () => {
      fetch(`/api/cron/reminders?secret=${SECRET}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.log?.length) {
            console.log("[CronKeeper]", d.log);
          }
        })
        .catch((e) => console.warn("[CronKeeper] ping failed:", e));
    };

    // Ping immediately on mount (handles page reload at any hour)
    ping();

    const timer = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return null; // renders nothing
}
