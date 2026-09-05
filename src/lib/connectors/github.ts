import { PlatformStats, PlatformStreak } from "../types";
import { ConnectorOptions } from "./types";

export interface GitHubConnectorResult {
  stats: PlatformStats;
  activeDates: Set<string>;
}

export async function fetchGitHubStats(
  handle: string = "",
  options: ConnectorOptions = {}
): Promise<GitHubConnectorResult> {
  const activeDates = new Set<string>();

  if (!handle || !handle.trim() || handle === "pending_setup") {
    return {
      stats: {
        platform: "github",
        handle: handle || "Not Connected",
        rating: null,
        maxRating: null,
        rank: "NOT CONNECTED",
        problemsSolved: 0,
        lastSyncedAt: new Date().toISOString(),
      },
      activeDates,
    };
  }

  const timeoutMs = options.timeoutMs || 6000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let publicRepos = 0;
  let totalCommits = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let totalActiveDays = 0;

  try {
    // 1. Fetch user profile from GitHub API
    try {
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
        headers: {
          "User-Agent": "RankStack/1.0",
          Accept: "application/vnd.github.v3+json",
        },
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        publicRepos = userData.public_repos ?? publicRepos;
      }
    } catch {
      // Non-fatal, use defaults
    }

    // 2. Fetch contributions calendar
    try {
      const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(handle)}`, {
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      if (contribRes.ok) {
        const contribData = await contribRes.json();
        const days: { date: string; count: number }[] = contribData.contributions || [];

        let commitSum = 0;
        let activeCount = 0;
        let curStreakCounter = 0;
        let maxStreakCounter = 0;
        let tempStreak = 0;

        for (const day of days) {
          if (day.count > 0) {
            commitSum += day.count;
            activeCount++;
            activeDates.add(day.date);
            tempStreak++;
            if (tempStreak > maxStreakCounter) maxStreakCounter = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        // Calculate recent streak from the end of days array
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].count > 0) {
            curStreakCounter++;
          } else {
            // Check if today or yesterday
            if (i === days.length - 1) continue; // today might not have commits yet
            break;
          }
        }

        if (commitSum > 0) totalCommits = commitSum;
        if (activeCount > 0) totalActiveDays = activeCount;
        if (maxStreakCounter > 0) longestStreak = maxStreakCounter;
        currentStreak = curStreakCounter;
      }
    } catch {
      // Non-fatal
    }

    const streak: PlatformStreak = {
      platform: "github",
      currentStreak,
      longestStreak,
      totalActiveDays,
    };

    const stats: PlatformStats = {
      platform: "github",
      handle,
      rating: null,
      maxRating: null,
      rank: publicRepos > 0 ? `${publicRepos} REPOSITORIES` : "ACTIVE",
      problemsSolved: totalCommits, // represents commit contributions
      lastSyncedAt: new Date().toISOString(),
      streak,
    };

    return { stats, activeDates };
  } catch (error) {
    console.warn(`[GitHub Connector] Failed for handle "${handle}":`, error instanceof Error ? error.message : error);
    return {
      stats: {
        platform: "github",
        handle,
        rating: null,
        maxRating: null,
        rank: "OFFLINE",
        problemsSolved: 0,
        lastSyncedAt: new Date().toISOString(),
        streak: {
          platform: "github",
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
        },
      },
      activeDates,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
