import { Capacitor } from "@capacitor/core";
import { isSqliteOpen } from "@/db/sqlite-open";
import { createIdempotencyKey } from "@/sync/idempotency";
import { ensureNativeOutboxStore, getOutboxStore } from "@/sync/outbox";
import { getOutboxCounts } from "@/sync/outbox/api";
import { syncStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import type { OutboxEnqueueInput } from "./types";
import { STORAGE_KEY_PREFIX } from "@/config/constants";

const nativePendingBuffer: OutboxEnqueueInput[] = [];

let flushTimer: ReturnType<typeof setTimeout> | null = null;

const LEGACY_WEB_KEY = `${STORAGE_KEY_PREFIX}web_sync_outbox`;

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

async function migrateLegacyWebOutbox(): Promise<void> {
  if (Capacitor.getPlatform() !== "web") return;
  try {
    const raw = localStorage.getItem(LEGACY_WEB_KEY);
    if (!raw) return;
    const rows = JSON.parse(raw) as Array<{
      operation: string;
      payload: string;
    }>;
    if (!Array.isArray(rows) || rows.length === 0) return;
    const store = getOutboxStore();
    for (const row of rows) {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(row.payload) as Record<string, unknown>;
      } catch {
        payload = {};
      }
      await store.enqueue({
        entityType: "_legacy",
        action: "custom",
        operation: row.operation,
        payload,
        idempotencyKey: createIdempotencyKey({
          entityType: "_legacy",
          action: "custom",
          payloadVersion: row.payload,
        }),
      });
    }
    localStorage.removeItem(LEGACY_WEB_KEY);
  } catch {
    /* ignore corrupt legacy store */
  }
}

function toEnqueueOptions(input: OutboxEnqueueInput) {
  return {
    entityType: input.entityType ?? "_legacy",
    entityLocalId: input.entityLocalId,
    action: input.action ?? ("custom" as const),
    operation: input.operation,
    payload: input.payload,
    idempotencyKey: input.idempotencyKey,
  };
}

async function nativeEnqueue(input: OutboxEnqueueInput): Promise<void> {
  const options = toEnqueueOptions(input);
  if (!isSqliteOpen()) {
    nativePendingBuffer.push(input);
    patchSync((s) => ({
      ...s,
      pendingCount: s.pendingCount + 1,
    }));
    return;
  }
  await getOutboxStore().enqueue(options);
}

/** Drain in-memory buffer after `initDatabase` on native. */
export async function flushNativePendingBuffer(): Promise<void> {
  if (Capacitor.getPlatform() === "web" || !isSqliteOpen()) return;
  await ensureNativeOutboxStore();
  while (nativePendingBuffer.length > 0) {
    const item = nativePendingBuffer.shift();
    if (!item) break;
    await getOutboxStore().enqueue(toEnqueueOptions(item));
  }
  await updatePendingCount();
}

export function enqueueMutationLikeOperation(input: OutboxEnqueueInput): void {
  if (Capacitor.getPlatform() === "web") {
    void getOutboxStore()
      .enqueue(toEnqueueOptions(input))
      .then(() => updatePendingCount());
    return;
  }
  void nativeEnqueue(input).then(() => updatePendingCount());
}

export async function enqueueOutbox(
  input: import("./types").OutboxEnqueueOptions,
): Promise<void> {
  await getOutboxStore().enqueue(input);
  await updatePendingCount();
}

async function updatePendingCount() {
  try {
    const counts = await getOutboxCounts();
    patchSync((s) => ({
      ...s,
      pendingCount: counts.pending + counts.processing,
      deadCount: counts.dead,
    }));
  } catch {
    if (Capacitor.getPlatform() !== "web") {
      patchSync((s) => ({
        ...s,
        pendingCount: nativePendingBuffer.length,
      }));
    }
  }
}

export async function flushOutbox(): Promise<void> {
  const { syncEngineRunOnce } = await import("./engine");
  await syncEngineRunOnce();
  await updatePendingCount();
  if (appStore.get(syncStatusAtom).pendingCount > 0) {
    scheduleFlush(400);
  }
}

/** Web-only legacy outbox migration (called from `sync-lifecycle` on boot). */
export function migrateLegacyWebOutboxOnBoot(): void {
  void migrateLegacyWebOutbox().then(() => updatePendingCount());
}

/** @deprecated Use outbox store clear via sync reset in devtools */
export function clearWebOutbox(): void {
  void getOutboxStore()
    .clearDevOnly()
    .then(() => updatePendingCount());
  localStorage.removeItem(LEGACY_WEB_KEY);
}
