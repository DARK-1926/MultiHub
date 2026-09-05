import { PlatformStats } from "../types";

export interface ConnectorOptions {
  timeoutMs?: number;
}

export interface ConnectorResult {
  stats: PlatformStats;
  source: "live" | "fallback";
  error?: string;
}

export interface AggregatedStatsResult {
  platforms: PlatformStats[];
  totalProblemsSolved: number;
  lastSyncedAt: string;
  diagnostics: Record<string, { source: "live" | "fallback"; error?: string }>;
}
