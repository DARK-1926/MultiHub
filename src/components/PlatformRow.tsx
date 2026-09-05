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
    if (stats.handle === "each_twirl_69") {
      displayName = "CODECHEF (MAIN)";
      accountLabel = "@each_twirl_69 · Rated 2★";
    } else if (stats.handle === "iiitdw24bcs076") {
      displayName = "CODECHEF (COLLEGE)";
      accountLabel = "@iiitdw24bcs076 · IIIT Dharwad";
    }
  } else if (stats.platform === "leetcode") {
    displayName = "LEETCODE";
    accountLabel = `@${stats.handle}`;
  } else if (stats.platform === "gfg") {
    displayName = "GEEKSFORGEEKS";
    accountLabel = `@${stats.handle}`;
  } else if (stats.platform === "github") {
    displayName = "GITHUB";
    accountLabel = `@${stats.handle}`;
  } else if (stats.platform === "codeforces") {
    displayName = "CODEFORCES";
    accountLabel = "Pending Setup";
  }

  let leadingMetric = "UNRATED";
  if (stats.platform === "github") {
    leadingMetric = `${stats.problemsSolved} COMMITS`;
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
    <div className="flex items-center justify-between gap-4">
      {/* Left: Index + Metric & Title */}
      <div className="flex items-center gap-6 md:gap-12 flex-1 min-w-0">
        {/* Index & Leading Metric */}
        <div className="w-24 md:w-36 flex-shrink-0 flex flex-col font-space">
          <span className="text-[11px] text-ink/40 font-bold uppercase">
            0{index + 1} // {stats.platform === "github" ? "ACTIVITY" : "METRIC"}
          </span>
          <span className="text-base md:text-xl font-bold text-brand-orange tracking-tight truncate">
            {leadingMetric}
          </span>
        </div>

        {/* Title and Tag Row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <h3
              className="font-archivo uppercase text-ink tracking-tight transform transition-transform duration-200 group-hover:translate-x-4 truncate"
              style={{
                fontSize: "clamp(1.25rem, 3.5vw, 2.25rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
              }}
            >
              {displayName}
            </h3>
            <span className="text-xs font-space text-brand-orange font-bold hidden md:inline truncate">
              {accountLabel}
            </span>
          </div>

          {/* Tag row: sharp corners, high contrast black theme */}
          <div className="flex flex-wrap items-center gap-2 mt-2 font-space text-[11px] md:text-xs">
            <span className="border border-ink/40 bg-paper px-2 py-0.5 uppercase font-bold text-ink">
              {stats.platform === "github"
                ? `${stats.problemsSolved} CONTRIBUTIONS`
                : `${stats.problemsSolved} SOLVED`}
            </span>

            {stats.rating !== null ? (
              <span className="border border-ink/40 bg-paper px-2 py-0.5 uppercase font-bold text-ink">
                {stats.rating} RATING {stats.maxRating ? `(PEAK: ${stats.maxRating})` : ""}
              </span>
            ) : null}

            {stats.rank && (
              <span className="border border-brand-orange bg-paper px-2 py-0.5 uppercase font-bold text-brand-orange truncate max-w-[280px]">
                {stats.rank}
              </span>
            )}

            {/* Individual Platform Streak Badge */}
            {stats.streak && stats.streak.currentStreak > 0 && (
              <span className="border border-ink/40 bg-ink/[0.08] text-ink px-2 py-0.5 uppercase font-bold text-[10px] flex items-center gap-1">
                <Flame className="w-3 h-3 text-brand-orange" />
                <span>{stats.streak.currentStreak}D STREAK</span>
              </span>
            )}

            <span className="text-ink/60 uppercase md:hidden ml-1 truncate text-[11px]">
              {accountLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Orange Arrow Icon that rotates 45deg on hover and fades in */}
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <div className="transform transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:rotate-45 text-brand-orange">
          <ArrowUpRight className="w-8 h-8" />
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
        className="group block w-full bg-paper hover:bg-white/[0.04] border-b-2 border-borderline transition-colors duration-150 p-6 md:p-8 select-none"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={destinationUrl}
      className="group block w-full bg-paper hover:bg-white/[0.04] border-b-2 border-borderline transition-colors duration-150 p-6 md:p-8 select-none"
    >
      {content}
    </Link>
  );
};
