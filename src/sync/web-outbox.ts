import { STORAGE_KEY_PREFIX } from "@/config/constants";
import type { OutboxEnqueueInput } from "./types";

const KEY = `${STORAGE_KEY_PREFIX}web_sync_outbox`;

/** @deprecated Legacy localStorage outbox; migrated to IndexedDB on initSyncLayer */
type LegacyWebOutboxRecord = {
  operation: string;
  payload: string;
  created_at: string;
  attempts: number;
  status: string;
};

function read(): LegacyWebOutboxRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as LegacyWebOutboxRecord[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(rows: LegacyWebOutboxRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function webOutboxEnqueue(input: OutboxEnqueueInput): void {
  const rows = read();
  rows.push({
    operation: input.operation,
    payload: JSON.stringify(input.payload),
    created_at: new Date().toISOString(),
    attempts: 0,
    status: "pending",
  });
  write(rows);
}

export function webOutboxList(): LegacyWebOutboxRecord[] {
  return read();
}

export function webOutboxClear(): void {
  localStorage.removeItem(KEY);
}

export function webOutboxShift(): LegacyWebOutboxRecord | undefined {
  const rows = read();
  const first = rows.shift();
  write(rows);
  return first;
}
