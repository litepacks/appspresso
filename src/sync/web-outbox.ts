import { STORAGE_KEY_PREFIX } from "@/config/constants";
import type { OutboxEnqueueInput, OutboxRecord } from "./types";

const KEY = `${STORAGE_KEY_PREFIX}web_sync_outbox`;

function read(): OutboxRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as OutboxRecord[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(rows: OutboxRecord[]) {
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

export function webOutboxList(): OutboxRecord[] {
  return read();
}

export function webOutboxClear(): void {
  localStorage.removeItem(KEY);
}

export function webOutboxShift(): OutboxRecord | undefined {
  const rows = read();
  const first = rows.shift();
  write(rows);
  return first;
}
