import React from "react";
import { redirect } from "next/navigation";
import { FloatingNav, NavLinkItem } from "@/components/FloatingNav";
import { StatsHero } from "@/components/StatsHero";
import { PlatformList } from "@/components/PlatformList";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { ContestRadar } from "@/components/ContestRadar";
import { AiCoachCard } from "@/components/AiCoachCard";
import { SettingsForm } from "@/components/SettingsForm";
import { Footer } from "@/components/Footer";
import { CronKeeper } from "@/components/CronKeeper";
import { fetchAllPlatformStats, fetchRealStreakData } from "@/lib/connectors";
import { fetchUpcomingContests } from "@/lib/contests";
import { getRecommendations } from "@/lib/mockData";
import { PlatformStreak } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

const dashboardNavLinks: NavLinkItem[] = [
  { label: "Dashboard", href: "#overview" },
  { label: "Platforms", href: "#platforms" },
  { label: "Streak", href: "#streak" },
  { label: "Contests", href: "#contests" },
  { label: "AI Coach", href: "#coach" },
  { label: "Settings", href: "#settings" },
];

export default async function DashboardPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  await ensureSchema().catch(() => {}); // safe no-op if already exists
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ── Build handles from this user's DB record ──────────────────────────────
  const customHandles = {
    leetcode: user.lc_handle || "",
    codechef: user.cc_handles?.length ? user.cc_handles : [],
    gfg: user.gfg_handle || "",
    codeforces: user.cf_handle || "",
    github: user.github_handle || "",
  };

  // ── Fetch live data for this user ─────────────────────────────────────────
  const platforms = await fetchAllPlatformStats(customHandles);
  const streakData = await fetchRealStreakData(customHandles);
  const contests = await fetchUpcomingContests();
  const recommendations = getRecommendations();

  // ── Aggregate stats ───────────────────────────────────────────────────────
  const totalProblemsSolved = platforms.reduce(
    (sum, p) => sum + (p.problemsSolved || 0),
    0
  );

  const individualStreaks = platforms
    .map((p) => p.streak)
    .filter((s): s is PlatformStreak => s !== undefined);

  const latestSyncDate = platforms
    .map((p) => new Date(p.lastSyncedAt).getTime())
    .sort((a, b) => b - a)[0];
  const minutesAgo = Math.max(
    0,
    Math.round((Date.now() - latestSyncDate) / (1000 * 60))
  );
  const lastSyncedText =
    minutesAgo === 0 ? "Live connected just now" : `Last synced ${minutesAgo} mins ago`;

  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col selection:bg-brand-orange selection:text-black">
      {/* Background cron keeper */}
      <CronKeeper />

      <FloatingNav
        links={dashboardNavLinks}
        activeHref="#overview"
        brandHref="/dashboard"
        userName={user.name}
      />

      <div id="overview">
        <StatsHero
          currentStreak={streakData.currentStreak}
          lastSyncedText={lastSyncedText}
          totalProblemsSolved={totalProblemsSolved}
          userName={user.name}
        />
      </div>

      <div id="platforms">
        <PlatformList platforms={platforms} />
      </div>

      <div id="streak">
        <StreakHeatmap
          streakData={streakData}
          individualStreaks={individualStreaks}
        />
      </div>

      <div id="contests">
        <ContestRadar contests={contests} />
      </div>

      {/* Grid containing AI Coach and Settings */}
      <section
        id="coach"
        aria-label="Intelligence and Configuration"
        className="w-full bg-paper border-b-2 border-ink p-6 md:p-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AiCoachCard initialRecommendations={recommendations} />
          </div>
          <div id="settings">
            <SettingsForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
