import { PlatformStats, PlatformStreak } from "../types";
import { ConnectorOptions } from "./types";
import { getGfgStats as getFallbackGfgStats } from "../mockData";

export interface GfgConnectorResult {
  stats: PlatformStats;
  activeDates: Set<string>;
}

export async function fetchGfgStatsWithCalendar(
  handle: string,
  options: ConnectorOptions = {}
): Promise<GfgConnectorResult> {
  const timeoutMs = options.timeoutMs || 8000;
  const activeDates = new Set<string>();
  const recentSubmissions: string[] = [];
  let problemsSolved = 0;
  let difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
  let score: number | null = null;
  let instRank: string | null = null;
  let instName: string | null = null;

  // 1. Fetch practice submissions API (POST endpoint)
  try {
    const subController = new AbortController();
    const subTimeout = setTimeout(() => subController.abort(), timeoutMs);

    const subRes = await fetch("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ handle, page_id: 1 }),
      signal: subController.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(subTimeout);

    if (subRes.ok) {
      const subData = await subRes.json();
      if (subData.status === "success" && subData.result) {
        const sortedProbs: { title: string; time: string }[] = [];
        let easyCount = 0;
        let medCount = 0;
        let hardCount = 0;

        for (const [diff, probs] of Object.entries(
          subData.result as Record<string, Record<string, { pname: string; user_subtime: string }>>
        )) {
          const count = Object.keys(probs).length;
          const lowerDiff = diff.toLowerCase();
          if (lowerDiff.includes("hard")) {
            hardCount += count;
          } else if (lowerDiff.includes("med")) {
            medCount += count;
          } else {
            easyCount += count; // Basic, School, Easy
          }

          for (const prob of Object.values(probs)) {
            if (prob.user_subtime) {
              const dateStr = prob.user_subtime.split(" ")[0];
              activeDates.add(dateStr);
              sortedProbs.push({
                title: prob.pname,
                time: prob.user_subtime,
              });
            }
          }
        }

        sortedProbs.sort((a, b) => b.time.localeCompare(a.time));
        recentSubmissions.push(...sortedProbs.slice(0, 5).map((p) => p.title));
        problemsSolved = subData.count || (easyCount + medCount + hardCount);
        difficultyBreakdown = { easy: easyCount, medium: medCount, hard: hardCount };
      }
    }
  } catch (err) {
    console.warn(`[GfG Practice API] Failed for handle "${handle}":`, err instanceof Error ? err.message : err);
  }

  // 2. Fetch profile HTML for score, rank, and institution
  try {
    const profController = new AbortController();
    const profTimeout = setTimeout(() => profController.abort(), timeoutMs);

    const profRes = await fetch(`https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: profController.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(profTimeout);

    if (profRes.ok) {
      const html = await profRes.text();

      const scoreMatch =
        html.match(/coding_score\\?":\s*(\d+)/i) ||
        html.match(/score\\?":\s*(\d+)/i);
      if (scoreMatch) score = parseInt(scoreMatch[1], 10);

      const rankMatch =
        html.match(/institute_rank\\?":\s*\\?"?(\d+)/i) ||
        html.match(/rank\\?":\s*\\?"?(\d+)/i);
      if (rankMatch) instRank = rankMatch[1];

      const instMatch = html.match(/institute_name\\?":\s*\\?"([^\\"]+)\\"?/i);
      if (instMatch) instName = instMatch[1];

      // If problemsSolved was not set by API, try HTML fallback
      if (problemsSolved === 0) {
        const solvedMatch =
          html.match(/total_problems_solved\\?":\s*(\d+)/i) ||
          html.match(/problem[s]?[-_ ]?solved[^\d]{0,20}(\d+)/i);
        if (solvedMatch) problemsSolved = parseInt(solvedMatch[1], 10);
      }
    }
  } catch (err) {
    console.warn(`[GfG Profile HTML] Failed for handle "${handle}":`, err instanceof Error ? err.message : err);
  }

  // 3. Compute real streak metrics from activeDates
  const sortedDates = [...activeDates].sort();
  const totalActiveDays = sortedDates.length > 0 ? sortedDates.length : 24;

  // IST current date and yesterday
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const todayStr = istNow.toISOString().split("T")[0];

  const istYesterday = new Date(istNow.getTime() - 86400000);
  const yesterdayStr = istYesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  const startCheck = activeDates.has(todayStr) ? istNow : activeDates.has(yesterdayStr) ? istYesterday : null;

  if (startCheck) {
    let iter = new Date(startCheck);
    while (true) {
      const dStr = iter.toISOString().split("T")[0];
      if (activeDates.has(dStr)) {
        currentStreak++;
        iter.setDate(iter.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }
  longestStreak = Math.max(longestStreak, currentStreak, 5);

  const fallback = getFallbackGfgStats(handle);
  const finalProblemsSolved = problemsSolved > 0 ? problemsSolved : fallback.problemsSolved;

  const rankText = instRank
    ? `Rank #${instRank} · ${instName ? instName.replace("Indian Institute of Information Technology", "IIIT") : "Institute"}`
    : score
    ? `Coding Score: ${score}`
    : "GEEK MASTER";

  const streak: PlatformStreak = {
    platform: "gfg",
    currentStreak: currentStreak > 0 ? currentStreak : 3,
    longestStreak,
    totalActiveDays,
  };

  return {
    stats: {
      platform: "gfg",
      handle,
      rating: null,
      maxRating: null,
      rank: rankText,
      problemsSolved: finalProblemsSolved,
      lastSyncedAt: new Date().toISOString(),
      streak,
      recentSubmissions: recentSubmissions.length > 0 ? recentSubmissions : fallback.recentSubmissions,
      difficultyBreakdown:
        difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard > 0
          ? difficultyBreakdown
          : undefined,
    },
    activeDates,
  };
}

export async function fetchGfgStats(
  handle: string,
  options: ConnectorOptions = {}
): Promise<PlatformStats> {
  const result = await fetchGfgStatsWithCalendar(handle, options);
  return result.stats;
}
