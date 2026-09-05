"use client";

import React, { useState } from "react";
import { StreakData, Platform, PlatformStreak } from "@/lib/types";
import { Flame, Layers } from "lucide-react";

export interface StreakHeatmapProps {
  streakData: StreakData;
  individualStreaks?: PlatformStreak[];
  className?: string;
}

type HeatmapFilter = "all" | "github" | "leetcode" | "codechef" | "gfg";

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  streakData,
  individualStreaks = [],
  className = "",
}) => {
  const [activeFilter, setActiveFilter] = useState<HeatmapFilter>("all");
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    solved: boolean;
  } | null>(null);

  const currentHistory =
    activeFilter === "all"
      ? streakData.history
      : streakData.platformHistories?.[activeFilter as Platform] || streakData.history;

  const numWeeks = Math.ceil(currentHistory.length / 7);
  const weeks: { date: string; solved: boolean }[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    weeks.push(currentHistory.slice(w * 7, (w + 1) * 7));
  }

  const totalActive = currentHistory.filter((d) => d.solved).length;
  const consistencyPercent = Math.round((totalActive / (currentHistory.length || 1)) * 100);

  const streaksList: PlatformStreak[] = individualStreaks.length > 0 ? individualStreaks : [
    { platform: "github", currentStreak: 3, longestStreak: 46, totalActiveDays: 134 },
    { platform: "leetcode", currentStreak: 5, longestStreak: 14, totalActiveDays: 22 },
    { platform: "codechef", currentStreak: 3, longestStreak: 12, totalActiveDays: 38 },
    { platform: "gfg", currentStreak: 4, longestStreak: 16, totalActiveDays: 45 },
  ];

  return (
    <section
      aria-label="Solve Consistency Engine"
      className={`w-full bg-paper border-b-2 border-borderline p-6 md:p-12 ${className}`}
    >
      <div className="border-2 border-borderline bg-surface">
        {/* Header with Title and Filter Tabs */}
        <div className="px-6 py-5 border-b-2 border-borderline flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-space">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-brand-orange" />
            <div>
              <h3 className="font-archivo uppercase text-xl md:text-2xl tracking-tight text-ink">
                SOLVE CONSISTENCY ENGINE
              </h3>
              <p className="text-[11px] uppercase text-ink/70">
                52-WEEK MULTI-PLATFORM MATRIX // {totalActive} ACTIVE DAYS ({consistencyPercent}% DEDICATION)
              </p>
            </div>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-ink/50 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              VIEW:
            </span>
            {(["all", "github", "leetcode", "codechef", "gfg"] as HeatmapFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 uppercase font-bold border-2 transition-colors ${
                  activeFilter === tab
                    ? "bg-brand-orange text-black border-brand-orange font-bold"
                    : "bg-paper text-ink border-borderline hover:border-brand-orange hover:text-brand-orange"
                }`}
              >
                {tab === "all" ? "COMBINED" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Individual Platform Streaks Comparison Bar (All 5 Accounts Including GfG) */}
        <div className="px-6 py-4 border-b-2 border-borderline bg-surface font-space text-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {streaksList.map((item, idx) => (
            <div
              key={`${item.platform}-${idx}`}
              className={`border-2 p-3 transition-colors ${
                activeFilter === item.platform
                  ? "bg-brand-orange/10 border-brand-orange"
                  : "bg-paper border-borderline"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-ink">
                  {item.platform === "codechef"
                    ? (idx === 1 ? "CC (MAIN)" : "CC (COLLEGE)")
                    : item.platform}
                </span>
                <span className="text-[10px] text-brand-orange font-bold uppercase">
                  STREAK
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand-orange">
                  {item.currentStreak}D
                </span>
                <span className="text-[10px] text-ink/60 uppercase">
                  (REC: {item.longestStreak}D)
                </span>
              </div>
              <div className="text-[10px] text-ink/50 uppercase mt-0.5">
                {item.totalActiveDays} ACTIVE DAYS
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="p-6 overflow-x-auto bg-paper">
          <div className="min-w-[760px]">
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[12px] h-[12px] transition-transform duration-100 hover:scale-125 cursor-crosshair ${
                        day.solved
                          ? "bg-brand-orange shadow-[0_0_6px_rgba(255,77,0,0.5)]"
                          : "bg-white/[0.08] hover:bg-white/20"
                      }`}
                      title={`${day.date}: ${day.solved ? "Active solve/commit recorded" : "Rest"}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom Info & Legend */}
            <div className="mt-6 pt-4 border-t-2 border-borderline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-space text-[11px] uppercase text-ink">
              <div className="flex items-center gap-3">
                <span className="text-ink/60">INSPECTION ({activeFilter.toUpperCase()}):</span>
                {hoveredDay ? (
                  <span className="font-bold text-ink">
                    {hoveredDay.date} //{" "}
                    <span
                      className={
                        hoveredDay.solved
                          ? "text-brand-orange"
                          : "text-ink/50"
                      }
                    >
                      {hoveredDay.solved ? "ACTIVE SOLVES / COMMITS" : "REST DAY"}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink/40">HOVER ANY MATRIX CELL</span>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2">
                <span className="text-ink/60">INACTIVE</span>
                <span className="w-3 h-3 bg-white/[0.08] inline-block border border-borderline" />
                <span className="w-3 h-3 bg-brand-orange inline-block" />
                <span className="text-ink/60">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
