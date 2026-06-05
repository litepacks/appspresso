import type { CheckDomain } from "@/lib/api";

const STORAGE_KEY = "studio:validation-history";
const MAX_ENTRIES = 10;

export type ValidationHistoryEntry = {
  at: string;
  ok: boolean;
  domains: CheckDomain[];
  durationMs: number;
};

export function getValidationHistory(): ValidationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ValidationHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendValidationHistory(entry: ValidationHistoryEntry) {
  const prev = getValidationHistory();
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
