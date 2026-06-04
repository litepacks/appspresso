import { Capacitor } from "@capacitor/core";
import { http } from "@/api/http";
import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { isSqliteOpen } from "@/db/sqlite";
import { logger } from "@/lib/logger";
import { initNetworkListeners } from "@/services/network.service";
import { syncStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import type { OutboxEnqueueInput } from "./types";
import {
  webOutboxClear,
  webOutboxEnqueue,
  webOutboxList,
  webOutboxShift,
} from "./web-outbox";

const DB = "app_kit_db";
const MAX_NATIVE_ATTEMPTS = 5;
const NATIVE_FLUSH_BACKOFF_MS = 400;

/** Held until native SQLite opens (cold start defers DB init). */
const nativePendingBuffer: OutboxEnqueueInput[] = [];

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let onlineCleanup: (() => void) | null = null;

function patchSync(
  fn: (prev: {
    pendingCount: number;
    isFlushing: boolean;
    lastFlushAt?: number;
    lastError?: string;
  }) => {
    pendingCount: number;
    isFlushing: boolean;
    lastFlushAt?: number;
    lastError?: string;
  },
) {
  appStore.set(syncStatusAtom, fn(appStore.get(syncStatusAtom)));
}

function scheduleFlush(ms = 400) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushOutbox();
  }, ms);
}

async function nativeInsertRow(input: OutboxEnqueueInput): Promise<void> {
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: DB,
    statement:
      "INSERT INTO sync_outbox(operation,payload,created_at,attempts,status) VALUES(?,?,?,?,?)",
    values: [
      input.operation,
      JSON.stringify(input.payload),
      new Date().toISOString(),
      0,
      "pending",
    ],
  });
}

async function nativeEnqueue(input: OutboxEnqueueInput): Promise<void> {
  if (!isSqliteOpen()) {
    nativePendingBuffer.push(input);
    patchSync((s) => ({
      ...s,
      pendingCount: s.pendingCount + 1,
    }));
    return;
  }
  await nativeInsertRow(input);
}

/** Drain in-memory buffer after `initDatabase` on native. */
export async function flushNativePendingBuffer(): Promise<void> {
  if (Capacitor.getPlatform() === "web" || !isSqliteOpen()) return;
  while (nativePendingBuffer.length > 0) {
    const item = nativePendingBuffer.shift();
    if (!item) break;
    await nativeInsertRow(item);
  }
  updatePendingCount();
}

async function nativePendingCount(): Promise<number> {
  if (!isSqliteOpen()) return nativePendingBuffer.length;
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: DB,
    statement: "SELECT COUNT(*) as c FROM sync_outbox WHERE status = 'pending'",
  });
  return Number(res?.values?.[0]?.[0] ?? 0);
}

async function nativeShiftOne(): Promise<{
  id: number;
  payload: string;
} | null> {
  if (!isSqliteOpen()) return null;
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: DB,
    statement:
      "SELECT id, payload FROM sync_outbox WHERE status = 'pending' ORDER BY id ASC LIMIT 1",
  });
  const row = res?.values?.[0];
  if (!row) return null;
  return { id: Number(row[0]), payload: String(row[1] ?? "") };
}

async function nativeDelete(id: number): Promise<void> {
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: DB,
    statement: "DELETE FROM sync_outbox WHERE id = ?",
    values: [id],
  });
}

async function nativeGetAttempts(id: number): Promise<number> {
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: DB,
    statement: "SELECT attempts FROM sync_outbox WHERE id = ?",
    values: [id],
  });
  return Number(res?.values?.[0]?.[0] ?? 0);
}

async function nativeMarkFailed(id: number): Promise<void> {
  const prev = await nativeGetAttempts(id);
  const attempts = prev + 1;
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: DB,
    statement: "UPDATE sync_outbox SET attempts = ?, status = ? WHERE id = ?",
    values: [
      attempts,
      attempts >= MAX_NATIVE_ATTEMPTS ? "failed" : "pending",
      id,
    ],
  });
}

export function enqueueMutationLikeOperation(input: OutboxEnqueueInput): void {
  if (Capacitor.getPlatform() === "web") {
    webOutboxEnqueue(input);
    updatePendingCount();
    return;
  }
  void nativeEnqueue(input).then(() => updatePendingCount());
}

function updatePendingCount() {
  if (Capacitor.getPlatform() === "web") {
    patchSync((s) => ({ ...s, pendingCount: webOutboxList().length }));
  } else {
    void nativePendingCount().then((c) =>
      patchSync((s) => ({ ...s, pendingCount: c })),
    );
  }
}

export async function flushOutbox(): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    const next = webOutboxShift();
    if (!next) {
      patchSync((s) => ({ ...s, isFlushing: false, pendingCount: 0 }));
      return;
    }
    patchSync((s) => ({ ...s, isFlushing: true }));
    try {
      const body = JSON.parse(next.payload) as Record<string, unknown>;
      const path = typeof body.path === "string" ? body.path : "/api/dummy";
      await http.post(path, body, {
        timeout: 5000,
        validateStatus: () => true,
      });
      patchSync((s) => ({
        ...s,
        isFlushing: false,
        lastFlushAt: Date.now(),
        pendingCount: webOutboxList().length,
      }));
      scheduleFlush(0);
    } catch (e) {
      logger.warn("flushOutbox web", { e: String(e) });
      webOutboxEnqueue({
        operation: next.operation,
        payload: JSON.parse(next.payload) as Record<string, unknown>,
      });
      patchSync((s) => ({
        ...s,
        isFlushing: false,
        lastError: String(e),
      }));
    }
    return;
  }

  patchSync((s) => ({ ...s, isFlushing: true }));
  const row = await nativeShiftOne();
  if (!row) {
    patchSync((s) => ({ ...s, isFlushing: false, pendingCount: 0 }));
    return;
  }
  try {
    const body = JSON.parse(row.payload) as Record<string, unknown>;
    const path = typeof body.path === "string" ? body.path : "/api/dummy";
    await http.post(path, body, { timeout: 5000, validateStatus: () => true });
    await nativeDelete(row.id);
    patchSync((s) => ({
      ...s,
      isFlushing: false,
      lastFlushAt: Date.now(),
    }));
    const c = await nativePendingCount();
    patchSync((s) => ({ ...s, pendingCount: c }));
    scheduleFlush(0);
  } catch (e) {
    logger.warn("flushOutbox native", { e: String(e) });
    await nativeMarkFailed(row.id);
    patchSync((s) => ({
      ...s,
      isFlushing: false,
      lastError: String(e),
    }));
    scheduleFlush(NATIVE_FLUSH_BACKOFF_MS);
  }
}

export function initSyncLayer(): void {
  updatePendingCount();
  onlineCleanup = initNetworkListeners(() => scheduleFlush(0));
}

export function teardownSyncLayer(): void {
  onlineCleanup?.();
  onlineCleanup = null;
  if (flushTimer) clearTimeout(flushTimer);
}

export function clearWebOutbox(): void {
  webOutboxClear();
}
