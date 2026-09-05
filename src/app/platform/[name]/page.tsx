import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import {
  fetchCodeforcesStats,
  fetchLeetCodeStats,
  fetchCodeChefStats,
  fetchGfgStats,
  fetchGitHubStats,
} from "@/lib/connectors";
import { DEFAULT_HANDLES } from "@/lib/config";
import { FloatingNav } from "@/components/FloatingNav";
import { Footer } from "@/components/Footer";
import { PlatformStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface PlatformPageProps {
  params: {
    name: string;
  };
}

export default async function PlatformDetailPage({ params }: PlatformPageProps) {
  const platformName = params.name.toLowerCase();

  let platform: PlatformStats;
  if (platformName === "codeforces") {
    platform = await fetchCodeforcesStats(DEFAULT_HANDLES.codeforces);
  } else if (platformName === "leetcode") {
    platform = await fetchLeetCodeStats(DEFAULT_HANDLES.leetcode);
  } else if (platformName === "codechef") {
    const ccAccounts = await fetchCodeChefStats(DEFAULT_HANDLES.codechef);
    platform = ccAccounts[0] || {
      platform: "codechef",
      handle: "each_twirl_69",
      rating: 1461,
      maxRating: 1461,
      rank: "2★ Div 3",
      problemsSolved: 91,
      lastSyncedAt: new Date().toISOString(),
    };
  } else if (platformName === "gfg") {
    platform = await fetchGfgStats(DEFAULT_HANDLES.gfg);
  } else if (platformName === "github") {
    const ghRes = await fetchGitHubStats(DEFAULT_HANDLES.github);
    platform = ghRes.stats;
  } else {
    platform = {
      platform: "codeforces",
      handle: "unknown",
      rating: null,
      maxRating: null,
      rank: "UNLINKED",
      problemsSolved: 0,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  const isCodeforcesPending = platformName === "codeforces" && platform.handle === "pending_setup";
  const isCodeChefMulti = platformName === "codechef" && Array.isArray(DEFAULT_HANDLES.codechef);

  const platformUrls: Record<string, string> = {
    codeforces: `https://codeforces.com/`,
    leetcode: `https://leetcode.com/u/${platform.handle}`,
    codechef: `https://www.codechef.com/users/each_twirl_69`,
    gfg: `https://www.geeksforgeeks.org/user/${platform.handle}/`,
    github: `https://github.com/${platform.handle}`,
  };

  const targetUrl = platformUrls[platform.platform] || "https://google.com";

  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col selection:bg-brand-orange selection:text-black">
      <FloatingNav
        links={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Platform Detail", href: "#detail" },
        ]}
        activeHref="#detail"
        brandHref="/dashboard"
      />

      <section
        id="detail"
        className="flex-1 w-full pt-28 pb-16 px-6 md:px-12 max-w-6xl mx-auto"
      >
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-space text-xs font-bold uppercase text-ink/70 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="border-2 border-borderline bg-surface p-8 md:p-12 mb-8">
          <div className="flex items-center justify-between font-space text-xs uppercase text-ink/60 mb-4">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-brand-orange shadow-[0_0_8px_#FF4D00]" />
              {isCodeforcesPending ? "SETUP PENDING" : "LIVE TELEMETRY FEED"}
            </span>
            <span>LAST SYNCED: {new Date(platform.lastSyncedAt).toLocaleTimeString()}</span>
          </div>

          <h1
            className="font-archivo uppercase text-ink tracking-tight mb-4"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            {platform.platform}
          </h1>

          <p className="font-space text-sm text-brand-orange font-bold uppercase mb-4">
            HANDLE: @{platform.handle}
          </p>

          {/* Special notice for Codeforces if pending */}
          {isCodeforcesPending && (
            <div className="mb-8 p-4 border-2 border-borderline bg-paper font-space text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-brand-orange flex-shrink-0" />
              <div>
                <span className="font-bold text-ink uppercase">CODEFORCES ON STANDBY: </span>
                <span className="text-ink/70">
                  You requested to leave Codeforces for now. Whenever you are ready, add your handle in Dashboard Settings or .env.local to activate tracking!
                </span>
              </div>
            </div>
          )}

          {/* Multi-account breakdown for CodeChef */}
          {isCodeChefMulti && (
            <div className="mb-8 p-4 border-2 border-borderline bg-paper font-space text-xs">
              <div className="flex items-center gap-2 mb-2 font-bold uppercase text-brand-orange">
                <ShieldCheck className="w-4 h-4" />
                <span>LINKED ACCOUNTS (BOTH TRACKED IN DEDICATED PANELS)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-ink">
                <a
                  href="https://www.codechef.com/users/each_twirl_69"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-borderline p-3 bg-surface hover:border-brand-orange transition-colors block"
                >
                  <div className="font-bold text-brand-orange">@each_twirl_69 (Main Account)</div>
                  <div className="text-[11px] text-ink/70 mt-1">Rating: 1461 (2★ Div 3) · 91 Solved</div>
                </a>
                <a
                  href="https://www.codechef.com/users/iiitdw24bcs076"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-borderline p-3 bg-surface hover:border-brand-orange transition-colors block"
                >
                  <div className="font-bold text-ink">@iiitdw24bcs076 (College Account)</div>
                  <div className="text-[11px] text-ink/70 mt-1">IIIT Dharwad Practice · 88 Solved</div>
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t-2 border-borderline pt-8 font-space">
            <div className="border-2 border-borderline p-5 bg-paper">
              <div className="text-xs text-ink/60 uppercase">Current Rating</div>
              <div className="text-2xl md:text-3xl font-bold text-brand-orange mt-1">
                {platform.rating !== null ? platform.rating : "UNRATED"}
              </div>
              {platform.maxRating && (
                <div className="text-[11px] text-ink/70 mt-1 uppercase">
                  PEAK: {platform.maxRating}
                </div>
              )}
            </div>

            <div className="border-2 border-borderline p-5 bg-paper">
              <div className="text-xs text-ink/60 uppercase">Tier / Status</div>
              <div className="text-xl md:text-2xl font-bold text-ink mt-1 truncate">
                {platform.rank || "ACTIVE"}
              </div>
              <div className="text-[11px] text-brand-orange mt-1 uppercase">
                {isCodeforcesPending ? "AWAITING CONFIG" : "VERIFIED STATUS"}
              </div>
            </div>

            <div className="border-2 border-borderline p-5 bg-paper">
              <div className="text-xs text-ink/60 uppercase">
                {platform.platform === "github" ? "Total Commits" : "Problems Solved"}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-ink mt-1">
                {platform.problemsSolved}
              </div>
              <div className="text-[11px] text-ink/70 mt-1 uppercase">
                {platform.platform === "github" ? "RECORDED CONTRIBUTIONS" : "ACCEPTED SUBMISSIONS"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-borderline font-space">
            <span className="text-xs text-ink/70 uppercase">
              // DIRECT PLATFORM PROFILE ACCESS
            </span>

            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-brand-orange text-black hover:bg-white hover:border-white font-space text-xs font-bold uppercase px-6 py-3 rounded-full border-2 border-brand-orange transition-transform duration-150 transform hover:scale-105"
            >
              <span>VIEW ON {platform.platform.toUpperCase()}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
