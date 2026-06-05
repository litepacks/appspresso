import { getOutboxStore } from "../outbox";
import { appendSyncLog, computeSyncHealthScore } from "../log";
import { getSyncProvider } from "../registry";
import { createLegacyHttpSyncProvider } from "../legacy-provider";
import {
  deleteSyncState,
  getSyncState,
  setSyncState,
  SYNC_STATE_KEYS,
} from "../sync-state";
import { getOutboxCounts } from "../outbox/api";
import { syncStatusAtom, type SyncSlice } from "@/state/atoms";
import { appStore } from "@/state/store";
import { PROCESSING_LEASE_MS } from "../types";
import { runPushPhase } from "./push";
import { runPullPhase } from "./pull";

let running = false;

function patchSync(fn: (prev: SyncSlice) => SyncSlice) {
  appStore.set(syncStatusAtom, fn(appStore.get(syncStatusAtom)));
}

function resolveProvider() {
  return getSyncProvider() ?? createLegacyHttpSyncProvider();
}

export async function syncEngineRunOnce(): Promise<void> {
  if (running) return;
  running = true;
  patchSync((s) => ({ ...s, isFlushing: true }));

  try {
    const paused = await getSyncState(SYNC_STATE_KEYS.enginePaused);
    if (paused === "auth") {
      appendSyncLog("warn", "engine.paused", { reason: paused });
      return;
    }

    const store = getOutboxStore();
    await store.releaseStaleProcessing(PROCESSING_LEASE_MS);

    const provider = resolveProvider();
    const { pushed, authFailure } = await runPushPhase(store, provider);
    if (authFailure) {
      await setSyncState(SYNC_STATE_KEYS.enginePaused, "auth");
      patchSync((s) => ({
        ...s,
        pausedReason: "auth",
        lastError: "auth",
      }));
      return;
    }

    await deleteSyncState(SYNC_STATE_KEYS.enginePaused);
    const pull = await runPullPhase(provider);

    const counts = await getOutboxCounts();
    const health = computeSyncHealthScore({
      pending: counts.pending,
      dead: counts.dead,
      lastErrorAgeMs: appStore.get(syncStatusAtom).lastError
        ? 0
        : undefined,
    });

    patchSync((s) => ({
      ...s,
      isFlushing: false,
      pendingCount: counts.pending + counts.processing,
      deadCount: counts.dead,
      lastFlushAt: Date.now(),
      lastPullAt: pull.pulled > 0 ? Date.now() : s.lastPullAt,
      healthScore: health,
      pausedReason: undefined,
    }));

    appendSyncLog("info", "engine.runOnce", { pushed, pull });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    patchSync((s) => ({
      ...s,
      isFlushing: false,
      lastError: msg,
    }));
    appendSyncLog("error", "engine.error", { message: msg });
  } finally {
    running = false;
  }
}

export async function syncEnginePullOnly(): Promise<void> {
  const provider = resolveProvider();
  await runPullPhase(provider);
}

export async function resumeSyncAfterAuth(): Promise<void> {
  await deleteSyncState(SYNC_STATE_KEYS.enginePaused);
  patchSync((s) => ({ ...s, pausedReason: undefined }));
  await syncEngineRunOnce();
}
