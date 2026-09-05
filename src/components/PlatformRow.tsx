"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { PlatformStats } from "@/lib/types";

export interface PlatformRowProps {
  stats: PlatformStats;
  index: number;
}

export const PlatformRow: React.FC<PlatformRowProps> = ({ stats, index }) => {
  let displayName = stats.platform.toUpperCase();
  let accountLabel = `@${stats.handle}`;

  if (stats.platform === "codechef") {
    displayName = "CODECHEF";
    accountLabel = `@${stats.handle}${stats.rank ? ` · ${stats.rank}` : ""}`;
  } else if (stats.platform === "leetcode") {
    displayName = "LEETCODE";
    accountLabel = `@${stats.handle}${stats.rank ? ` · ${stats.rank}` : ""}`;
  } else if (stats.platform === "gfg") {
    displayName = "GEEKSFORGEEKS";
    accountLabel = `@${stats.handle}`;
  } else if (stats.platform === "github") {
    displayName = "GITHUB";
    accountLabel = `@${stats.handle}`;
  } else if (stats.platform === "codeforces") {
    displayName = "CODEFORCES";
    accountLabel = stats.handle === "pending_setup" ? "Pending Setup" : `@${stats.handle}`;
  }

  let leadingMetric = "UNRATED";
  if (stats.platform === "github") {
    leadingMetric = `${stats.problemsSolved} COMMITS`;
  } else if (stats.platform === "gfg") {
    leadingMetric = stats.rank?.includes("Rank #")
      ? stats.rank.split("·")[0].trim()
      : `${stats.problemsSolved} SOLVED`;
  } else if (stats.rating !== null) {
    leadingMetric = stats.rating.toString();
  } else if (stats.rank) {
    leadingMetric = stats.rank;
  }

  const isExternal = stats.platform === "github" || stats.platform === "codechef";
  const destinationUrl =
    stats.platform === "github"
      ? `https://github.com/${stats.handle}`
      : stats.platform === "codechef"
      ? `https://www.codechef.com/users/${stats.handle}`
      : stats.platform === "codeforces" && stats.handle === "pending_setup"
      ? "#settings"
      : `/platform/${stats.platform}`;

  const content = (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      {/* Left: Index + Metric & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 md:gap-12 flex-1 min-w-0">
        {/* Index & Leading Metric */}
        <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start w-full sm:w-28 md:w-36 flex-shrink-0 font-space pb-1 sm:pb-0 border-b sm:border-b-0 border-borderline/40">
          <span className="text-[10px] md:text-[11px] text-ink/40 font-bold uppercase">
            0{index + 1} // {stats.platform === "github" ? "ACTIVITY" : "METRIC"}
          </span>
          <span className="text-sm sm:text-base md:text-xl font-bold text-brand-orange tracking-tight truncate">
            {leadingMetric}
          </span>
        </div>

        {/* Title and Tag Row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between sm:justify-start gap-2 sm:gap-3">
            <h3
              className="font-archivo uppercase text-ink tracking-tight transform transition-transform duration-200 group-hover:translate-x-2 sm:group-hover:translate-x-4 truncate"
              style={{
                fontSize: "clamp(1.1rem, 3.5vw, 2.25rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              {displayName}
            </h3>
            <span className="text-[11px] sm:text-xs font-space text-brand-orange font-bold truncate">
              {accountLabel}
            </span>
          </div>

          {/* Tag row: sharp corners, high contrast black theme */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 font-space text-[10px] sm:text-[11px] md:text-xs">
            <span className="border border-ink/40 bg-paper px-1.5 sm:px-2 py-0.5 uppercase font-bold text-ink">
              {stats.platform === "github"
                ? `${stats.problemsSolved} CONTRIBUTIONS`
                : `${stats.problemsSolved} SOLVED`}
            </span>

            {stats.rating !== null ? (
              <span className="border border-ink/40 bg-paper px-1.5 sm:px-2 py-0.5 uppercase font-bold text-ink">
                {stats.rating} RATING {stats.maxRating ? `(PEAK: ${stats.maxRating})` : ""}
              </span>
            ) : null}

            {stats.rank && (
              <span className="border border-brand-orange bg-paper px-1.5 sm:px-2 py-0.5 uppercase font-bold text-brand-orange truncate max-w-[200px] sm:max-w-[280px]">
                {stats.rank}
              </span>
            )}

            {/* Individual Platform Streak Badge */}
            {stats.streak && stats.streak.currentStreak > 0 && (
              <span className="border border-ink/40 bg-ink/[0.08] text-ink px-1.5 sm:px-2 py-0.5 uppercase font-bold text-[10px] flex items-center gap-1">
                <Flame className="w-3 h-3 text-brand-orange" />
                <span>{stats.streak.currentStreak}D STREAK</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Orange Arrow Icon that rotates 45deg on hover and fades in */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center">
        <div className="transform transition-all duration-200 opacity-60 sm:opacity-0 group-hover:opacity-100 group-hover:rotate-45 text-brand-orange">
          <ArrowUpRight className="w-5 h-5 sm:w-8 sm:h-8" />
        </div>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={destinationUrl}
        target="_blank"
        rel="noreferrer"
        className="group block w-full bg-paper hover:bg-white/[0.04] border-b-2 border-borderline transition-colors duration-150 p-4 sm:p-6 md:p-8 select-none"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={destinationUrl}
      className="group block w-full bg-paper hover:bg-white/[0.04] border-b-2 border-borderline transition-colors duration-150 p-4 sm:p-6 md:p-8 select-none"
    >
      {content}
    </Link>
  );
};
