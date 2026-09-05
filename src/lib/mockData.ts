import { PlatformStats, StreakData, Recommendation } from "./types";

export function getCodeforcesStats(handle: string = "tourist_mind"): PlatformStats {
  return {
    platform: "codeforces",
    handle,
    rating: 1842,
    maxRating: 1910,
    rank: "Candidate Master",
    problemsSolved: 642,
    lastSyncedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  };
}

export function getLeetCodeStats(handle: string = "matrix_zen"): PlatformStats {
  return {
    platform: "leetcode",
    handle,
    rating: 2154,
    maxRating: 2198,
    rank: "Guardian",
    problemsSolved: 884,
    lastSyncedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  };
}

export function getCodeChefStats(handle: string = "byte_surfer"): PlatformStats {
  return {
    platform: "codechef",
    handle,
    rating: 2012,
    maxRating: 2050,
    rank: "5★",
    problemsSolved: 320,
    lastSyncedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  };
}

export function getGfgStats(handle: string = "geek_core"): PlatformStats {
  return {
    platform: "gfg",
    handle,
    rating: null,
    maxRating: null,
    rank: "Rank 42 · Institute Master",
    problemsSolved: 498,
    lastSyncedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  };
}

export function getAllPlatformStats(): PlatformStats[] {
  return [
    getCodeforcesStats(),
    getLeetCodeStats(),
    getCodeChefStats(),
    getGfgStats(),
  ];
}

export function getStreakData(): StreakData {
  const totalDays = 371; // 53 weeks * 7 days
  const history: { date: string; solved: boolean }[] = [];
  const now = new Date();

  // Deterministic pattern: recent 23 days consecutive true, preceding days have realistic CP activity (~75% solved)
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let solved = false;
    if (i < 23) {
      // Current streak: all solved
      solved = true;
    } else {
      // Pseudo-random deterministic distribution based on day of year & index
      const dayOfWeek = d.getDay();
      const pseudoHash = (i * 37 + dayOfWeek * 13 + d.getDate() * 7) % 100;
      // High frequency during weekdays, occasional weekend breaks
      solved = pseudoHash > 24;
    }

    history.push({
      date: dateStr,
      solved,
    });
  }

  return {
    currentStreak: 23,
    longestStreak: 74,
    lastActiveDate: now.toISOString().split("T")[0],
    history,
  };
}

export function getRecommendations(): Recommendation[] {
  return [
    {
      id: "rec-1",
      title: "1872F - Vlad and Avoiding Crossing",
      platform: "codeforces",
      difficulty: "1700-1900",
      url: "https://codeforces.com/problemset/problem/1872/F",
      reason: "Reinforce functional graph cycle-detection and topological sorting.",
    },
    {
      id: "rec-2",
      title: "146. LRU Cache",
      platform: "leetcode",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/lru-cache/",
      reason: "Frequent system interview primitive requiring O(1) doubly-linked list & hashmap.",
    },
    {
      id: "rec-3",
      title: "TREEORD - Tree Order Traversal",
      platform: "codechef",
      difficulty: "1800+",
      url: "https://www.codechef.com/problems/TREEORD",
      reason: "Tree reconstruction from pre/in/post orders; targets your lowest percentile topic.",
    },
    {
      id: "rec-4",
      title: "Find Median in a Data Stream",
      platform: "gfg",
      difficulty: "Hard",
      url: "https://www.geeksforgeeks.org/find-median-in-a-stream-of-integers-running-integers/",
      reason: "Dual-heap balancing under heavy stream ingestion constraint.",
    },
  ];
}
