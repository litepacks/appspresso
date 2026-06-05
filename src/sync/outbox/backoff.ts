import { DEFAULT_MAX_OUTBOX_ATTEMPTS } from "../types";

export function computeBackoffMs(attempts: number): number {
  const base = 1000 * 2 ** Math.max(0, attempts);
  return Math.min(base, 5 * 60 * 1000);
}

export function shouldMarkDead(
  attempts: number,
  retryable: boolean,
  maxAttempts = DEFAULT_MAX_OUTBOX_ATTEMPTS,
): boolean {
  if (!retryable) return true;
  return attempts >= maxAttempts;
}

export function scheduledAtFromAttempts(attempts: number): string {
  return new Date(Date.now() + computeBackoffMs(attempts)).toISOString();
}
