import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import { clearSyncProvider, registerSyncProvider } from "../registry";
import { createFakeSyncProvider } from "../testing/fake-provider";

const mockStore = vi.hoisted(() => ({
  releaseStaleProcessing: vi.fn().mockResolvedValue(0),
  claimNext: vi.fn(),
  markSynced: vi.fn().mockResolvedValue(undefined),
  markFailed: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../outbox", () => ({
  getOutboxStore: () => mockStore,
}));

vi.mock("../outbox/api", () => ({
  getOutboxCounts: vi.fn().mockResolvedValue({
    pending: 0,
    processing: 0,
    synced: 1,
    failed: 0,
    dead: 0,
  }),
}));

vi.mock("../sync-state", () => ({
  getSyncState: vi.fn().mockResolvedValue(null),
  setSyncState: vi.fn().mockResolvedValue(undefined),
  deleteSyncState: vi.fn().mockResolvedValue(undefined),
  SYNC_STATE_KEYS: { enginePaused: "engine_paused_reason", lastPushAt: "last_push_at", lastPullAt: "last_pull_at", pullCursor: (t: string) => `pull_cursor:${t}` },
}));

const { syncEngineRunOnce } = await import("./index");

describe("SyncEngine", () => {
  beforeEach(() => {
    clearSyncProvider();
    appStore.set(syncStatusAtom, { pendingCount: 0, isFlushing: false });
    mockStore.claimNext.mockReset();
    mockStore.markSynced.mockReset();
  });

  afterEach(() => {
    clearSyncProvider();
  });

  it("push phase marks job synced on success", async () => {
    mockStore.claimNext
      .mockResolvedValueOnce({
        id: 1,
        idempotencyKey: "k1",
        entityType: "todo",
        entityLocalId: "local-1",
        action: "create",
        operation: null,
        payload: JSON.stringify({ title: "a" }),
        status: "processing",
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .mockResolvedValueOnce(null);

    const provider = createFakeSyncProvider();
    registerSyncProvider(provider);

    await syncEngineRunOnce();

    expect(provider.pushCalls).toHaveLength(1);
    expect(mockStore.markSynced).toHaveBeenCalledWith(1);
    expect(appStore.get(syncStatusAtom).isFlushing).toBe(false);
  });

  it("pauses engine on auth failure", async () => {
    mockStore.claimNext.mockResolvedValueOnce({
      id: 2,
      idempotencyKey: "k2",
      entityType: "todo",
      action: "update",
      payload: "{}",
      status: "processing",
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    registerSyncProvider(
      createFakeSyncProvider({
        pushHandler: async () => ({
          ok: false,
          retryable: false,
          code: "auth",
          message: "401",
        }),
      }),
    );

    await syncEngineRunOnce();
    expect(appStore.get(syncStatusAtom).pausedReason).toBe("auth");
  });
});
