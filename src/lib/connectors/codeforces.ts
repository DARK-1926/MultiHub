import { PlatformStats } from "../types";
import { ConnectorOptions } from "./types";

export async function fetchCodeforcesStats(
  handle: string,
  options: ConnectorOptions = {}
): Promise<PlatformStats> {
  // If user requested to leave Codeforces for later
  if (!handle || handle.trim() === "" || handle === "pending" || handle === "unconfigured") {
    return {
      platform: "codeforces",
      handle: "pending_setup",
      rating: null,
      maxRating: null,
      rank: "PENDING SETUP",
      problemsSolved: 0,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  const timeoutMs = options.timeoutMs || 6000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Fetch user profile
    const userRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "RankStack/1.0 (CP Dashboard; contact@rankstack.dev)",
        },
        next: { revalidate: 300 },
      }
    );

    if (!userRes.ok) {
      throw new Error(`Codeforces API returned HTTP ${userRes.status}`);
    }

    const userData = await userRes.json();
    if (userData.status !== "OK" || !userData.result?.[0]) {
      throw new Error(`Codeforces API error: ${userData.comment || "User not found"}`);
    }

    const user = userData.result[0];

    // 2. Fetch submission history for problem solve count
    let problemsSolved = 0;
    try {
      const statusRes = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "RankStack/1.0 (CP Dashboard; contact@rankstack.dev)",
          },
          next: { revalidate: 300 },
        }
      );

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status === "OK" && Array.isArray(statusData.result)) {
          const uniqueSolved = new Set<string>();
          for (const sub of statusData.result) {
            if (sub.verdict === "OK" && sub.problem) {
              uniqueSolved.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
          }
          problemsSolved = uniqueSolved.size;
        }
      }
    } catch {
      problemsSolved = user.contribution ? Math.abs(user.contribution) * 10 : 0;
    }

    return {
      platform: "codeforces",
      handle: user.handle,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ? user.rank.toUpperCase() : null,
      problemsSolved,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[Codeforces Connector] Failed for handle "${handle}":`, error instanceof Error ? error.message : error);
    return {
      platform: "codeforces",
      handle,
      rating: null,
      maxRating: null,
      rank: "OFFLINE / UNKNOWN",
      problemsSolved: 0,
      lastSyncedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
