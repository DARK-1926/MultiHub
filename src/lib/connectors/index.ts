import { PlatformStats, StreakData, Platform } from "../types";
import { DEFAULT_HANDLES, UserHandles } from "../config";
import { ConnectorOptions, AggregatedStatsResult } from "./types";
import { fetchCodeforcesStats } from "./codeforces";
import { fetchLeetCodeStatsWithCalendar } from "./leetcode";
import { fetchCodeChefStats, fetchCodeChefStatsWithCalendar } from "./codechef";
import { fetchGfgStats, fetchGfgStatsWithCalendar } from "./gfg";
import { fetchGitHubStats } from "./github";

export { fetchCodeforcesStats } from "./codeforces";
export { fetchLeetCodeStats } from "./leetcode";
export { fetchCodeChefStats } from "./codechef";
export { fetchGfgStats, fetchGfgStatsWithCalendar } from "./gfg";
export { fetchGitHubStats } from "./github";

export async function fetchAllPlatformStats(
  customHandles?: Partial<UserHandles>,
  options?: ConnectorOptions
): Promise<PlatformStats[]> {
  const handles: UserHandles = {
    ...DEFAULT_HANDLES,
    ...customHandles,
  };

  const platforms: PlatformStats[] = [];

  // 1. LeetCode (if configured)
  if (handles.leetcode && handles.leetcode.trim()) {
    try {
      const lcRes = await fetchLeetCodeStatsWithCalendar(handles.leetcode, options);
      platforms.push(lcRes.stats);
    } catch {
      platforms.push({
        platform: "leetcode",
        handle: handles.leetcode,
        rating: null,
        maxRating: null,
        rank: "CONNECTED",
        problemsSolved: 0,
        lastSyncedAt: new Date().toISOString(),
        streak: {
          platform: "leetcode",
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
        },
      });
    }
  }

  // 2. CodeChef (if configured)
  if (handles.codechef && handles.codechef.length > 0) {
    try {
      const ccAccounts = await fetchCodeChefStats(handles.codechef, options);
      platforms.push(...ccAccounts);
    } catch {
      for (const ccHandle of handles.codechef) {
        if (ccHandle.trim()) {
          platforms.push({
            platform: "codechef",
            handle: ccHandle,
            rating: null,
            maxRating: null,
            rank: "CONNECTED",
            problemsSolved: 0,
            lastSyncedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  // 3. GeeksforGeeks (if configured)
  if (handles.gfg && handles.gfg.trim()) {
    try {
      const gfgRes = await fetchGfgStats(handles.gfg, options);
      platforms.push(gfgRes);
    } catch {
      platforms.push({
        platform: "gfg",
        handle: handles.gfg,
        rating: null,
        maxRating: null,
        rank: "CONNECTED",
        problemsSolved: 0,
        lastSyncedAt: new Date().toISOString(),
      });
    }
  }

  // 4. Codeforces (if configured)
  if (handles.codeforces && handles.codeforces.trim() && handles.codeforces !== "pending_setup") {
    try {
      const cfRes = await fetchCodeforcesStats(handles.codeforces, options);
      platforms.push(cfRes);
    } catch {
      platforms.push({
        platform: "codeforces",
        handle: handles.codeforces,
        rating: null,
        maxRating: null,
        rank: "CONNECTED",
        problemsSolved: 0,
        lastSyncedAt: new Date().toISOString(),
      });
    }
  }

  // 5. GitHub (ONLY if user explicitly provided a handle)
  if (handles.github && handles.github.trim() && handles.github !== "pending_setup") {
    try {
      const ghRes = await fetchGitHubStats(handles.github, options);
      if (ghRes && ghRes.stats.handle !== "Not Connected") {
        platforms.push(ghRes.stats);
      }
    } catch {
      // Non-fatal
    }
  }

  return platforms;
}

export async function fetchRealStreakData(
  customHandles?: Partial<UserHandles>,
  options?: ConnectorOptions
): Promise<StreakData> {
  const handles: UserHandles = {
    ...DEFAULT_HANDLES,
    ...customHandles,
  };

  const lcDates = new Set<string>();
  const ghDates = new Set<string>();
  const ccDates = new Set<string>();
  const gfgDates = new Set<string>();

  const promises: Promise<unknown>[] = [];

  if (handles.leetcode && handles.leetcode.trim()) {
    promises.push(
      fetchLeetCodeStatsWithCalendar(handles.leetcode, options)
        .then((res) => {
          res.activeDates.forEach((d) => lcDates.add(d));
        })
        .catch(() => {})
    );
  }

  if (handles.github && handles.github.trim()) {
    promises.push(
      fetchGitHubStats(handles.github, options)
        .then((res) => {
          if (res?.activeDates) {
            res.activeDates.forEach((d) => ghDates.add(d));
          }
        })
        .catch(() => {})
    );
  }

  if (handles.codechef && handles.codechef.length > 0) {
    promises.push(
      fetchCodeChefStatsWithCalendar(handles.codechef, options)
        .then((res) => {
          res.activeDates.forEach((d) => ccDates.add(d));
        })
        .catch(() => {})
    );
  }

  if (handles.gfg && handles.gfg.trim()) {
    promises.push(
      fetchGfgStatsWithCalendar(handles.gfg, options)
        .then((res) => {
          if (res?.activeDates) {
            res.activeDates.forEach((d) => gfgDates.add(d));
          }
        })
        .catch(() => {})
    );
  }

  await Promise.allSettled(promises);

  const totalDays = 371; // 53 weeks * 7 days
  const now = new Date();

  const combinedHistory: { date: string; solved: boolean }[] = [];
  const lcHistory: { date: string; solved: boolean }[] = [];
  const ghHistory: { date: string; solved: boolean }[] = [];
  const ccHistory: { date: string; solved: boolean }[] = [];
  const gfgHistory: { date: string; solved: boolean }[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const isGhActive = ghDates.has(dateStr);
    const isLcActive = lcDates.has(dateStr);
    const isCcActive = ccDates.has(dateStr);
    const isGfgActive = gfgDates.has(dateStr);

    const isAnyActive = isGhActive || isLcActive || isCcActive || isGfgActive;

    combinedHistory.push({ date: dateStr, solved: isAnyActive });
    ghHistory.push({ date: dateStr, solved: isGhActive });
    lcHistory.push({ date: dateStr, solved: isLcActive });
    ccHistory.push({ date: dateStr, solved: isCcActive });
    gfgHistory.push({ date: dateStr, solved: isGfgActive });
  }

  let currentStreak = 0;
  for (let i = combinedHistory.length - 1; i >= 0; i--) {
    if (combinedHistory[i].solved) {
      currentStreak++;
    } else {
      if (i === combinedHistory.length - 1) continue;
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < combinedHistory.length; i++) {
    if (combinedHistory[i].solved) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: now.toISOString().split("T")[0],
    history: combinedHistory,
    platformHistories: {
      github: ghHistory,
      leetcode: lcHistory,
      codechef: ccHistory,
      gfg: gfgHistory,
    },
  };
}

export async function fetchAggregatedStats(
  customHandles?: Partial<UserHandles>,
  options?: ConnectorOptions
): Promise<AggregatedStatsResult> {
  const platforms = await fetchAllPlatformStats(customHandles, options);

  const totalProblemsSolved = platforms.reduce(
    (sum, p) => sum + (p.problemsSolved || 0),
    0
  );

  const timestamps = platforms.map((p) => new Date(p.lastSyncedAt).getTime());
  const latestTimestamp = Math.max(...timestamps, Date.now());

  return {
    platforms,
    totalProblemsSolved,
    lastSyncedAt: new Date(latestTimestamp).toISOString(),
    diagnostics: {
      codeforces: { source: "live" },
      leetcode: { source: "live" },
      codechef: { source: "live" },
      gfg: { source: "live" },
      github: { source: "live" },
    },
  };
}
