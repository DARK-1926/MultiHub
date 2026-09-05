export type Platform = 'codeforces' | 'leetcode' | 'codechef' | 'gfg' | 'github';

export interface PlatformStreak {
  platform: Platform;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export interface PlatformStats {
  platform: Platform;
  handle: string;
  rating: number | null;      // null if platform has no rating (e.g. GfG, GitHub)
  maxRating: number | null;
  rank: string | null;        // e.g. "Expert", "Guardian", or null
  problemsSolved: number;
  lastSyncedAt: string;       // ISO 8601 date string
  streak?: PlatformStreak;    // Individual platform streak
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;     // ISO date
  history: { date: string; solved: boolean }[]; // last 371 days, for the heatmap
  platformHistories?: Partial<Record<Platform, { date: string; solved: boolean }[]>>;
}

export interface Recommendation {
  id: string;
  title: string;
  platform: Platform;
  difficulty: string;         // e.g. "1600-1800", "Medium"
  url: string;
  reason: string;             // one line — why this was picked
}

export interface ContestItem {
  id: string;
  name: string;
  platform: Platform;
  startTime: string;          // ISO 8601
  durationSeconds: number;
  url: string;
}
