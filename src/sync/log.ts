export type SyncLogLevel = "info" | "warn" | "error";

export type SyncLogEntry = {
  at: number;
  level: SyncLogLevel;
  event: string;
  detail?: Record<string, unknown>;
};

const MAX_ENTRIES = 200;
const buffer: SyncLogEntry[] = [];

export function appendSyncLog(
  level: SyncLogLevel,
  event: string,
  detail?: Record<string, unknown>,
): void {
  buffer.push({ at: Date.now(), level, event, detail });
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

export function getSyncLogs(limit = 50): SyncLogEntry[] {
  return buffer.slice(-limit);
}

export function clearSyncLogs(): void {
  buffer.length = 0;
}

export function computeSyncHealthScore(counts: {
  pending: number;
  dead: number;
  lastErrorAgeMs?: number;
}): number {
  let score = 100;
  score -= Math.min(counts.pending * 2, 30);
  score -= Math.min(counts.dead * 10, 40);
  if (counts.lastErrorAgeMs != null && counts.lastErrorAgeMs < 60_000) {
    score -= 20;
  }
  return Math.max(0, Math.min(100, score));
}
