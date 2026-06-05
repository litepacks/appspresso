import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const mockEnqueue = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockClaimNext = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockGetCounts = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    pending: 0,
    processing: 0,
    synced: 0,
    failed: 0,
    dead: 0,
  }),
);
const mockEngineRun = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockIsSqliteOpen = vi.hoisted(() => vi.fn(() => false));
const mockGetPlatform = vi.hoisted(() => vi.fn(() => "web"));

vi.mock("@/db/sqlite-open", () => ({
  isSqliteOpen: mockIsSqliteOpen,
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: mockGetPlatform,
    isNativePlatform: () => mockGetPlatform() !== "web",
  },
}));

vi.mock("@/sync/outbox", () => ({
  ensureNativeOutboxStore: vi.fn().mockResolvedValue({
    enqueue: mockEnqueue,
    claimNext: mockClaimNext,
    markSynced: vi.fn(),
    markFailed: vi.fn(),
    releaseStaleProcessing: vi.fn(),
    retryJob: vi.fn(),
    countByStatus: mockGetCounts,
    list: vi.fn().mockResolvedValue([]),
    clearDevOnly: vi.fn().mockResolvedValue(undefined),
  }),
  getOutboxStore: () => ({
    enqueue: mockEnqueue,
    claimNext: mockClaimNext,
    markSynced: vi.fn(),
    markFailed: vi.fn(),
    releaseStaleProcessing: vi.fn(),
    retryJob: vi.fn(),
    countByStatus: mockGetCounts,
    list: vi.fn().mockResolvedValue([]),
    clearDevOnly: vi.fn().mockResolvedValue(undefined),
  }),
  resetOutboxStoreForTests: vi.fn(),
}));

vi.mock("@/sync/outbox/api", () => ({
  getOutboxCounts: mockGetCounts,
}));

vi.mock("./engine", () => ({
  syncEngineRunOnce: mockEngineRun,
}));

const {
  clearWebOutbox,
  enqueueMutationLikeOperation,
  flushNativePendingBuffer,
  flushOutbox,
} = await import("./sync.service");
const { initSyncLayer, teardownSyncLayer } = await import("./sync-lifecycle");

function resetSyncTestState() {
  teardownSyncLayer();
  localStorage.clear();
  mockIsSqliteOpen.mockReturnValue(false);
  mockGetPlatform.mockReturnValue("web");
  mockEnqueue.mockClear();
  mockEngineRun.mockClear();
  mockGetCounts.mockResolvedValue({
    pending: 1,
    processing: 0,
    synced: 0,
    failed: 0,
    dead: 0,
  });
  appStore.set(syncStatusAtom, { pendingCount: 0, isFlushing: false });
}

describe("sync.service", () => {
  beforeEach(() => {
    resetSyncTestState();
  });

  afterEach(() => {
    resetSyncTestState();
  });

  it("web: enqueue calls outbox store", async () => {
    mockGetPlatform.mockReturnValue("web");
    enqueueMutationLikeOperation({
      operation: "demo",
      payload: { path: "/api/demo", body: 1 },
    });
    await vi.waitFor(() => expect(mockEnqueue).toHaveBeenCalled());
    expect(mockEnqueue.mock.calls[0][0].action).toBe("custom");
  });

  it("flush delegates to SyncEngine", async () => {
    await flushOutbox();
    expect(mockEngineRun).toHaveBeenCalled();
  });

  it("native: buffers enqueue when SQLite is not open yet", () => {
    mockGetPlatform.mockReturnValue("ios");
    mockIsSqliteOpen.mockReturnValue(false);

    enqueueMutationLikeOperation({
      operation: "buf",
      payload: { path: "/api/buf" },
    });

    expect(appStore.get(syncStatusAtom).pendingCount).toBe(1);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it("native: flushNativePendingBuffer drains buffer after DB opens", async () => {
    mockGetPlatform.mockReturnValue("ios");
    mockIsSqliteOpen.mockReturnValue(false);

    enqueueMutationLikeOperation({
      operation: "buf",
      payload: { path: "/api/buf2" },
    });

    mockIsSqliteOpen.mockReturnValue(true);
    mockGetCounts.mockResolvedValue({
      pending: 0,
      processing: 0,
      synced: 0,
      failed: 0,
      dead: 0,
    });
    await flushNativePendingBuffer();

    expect(mockEnqueue).toHaveBeenCalled();
  });

  it("initSyncLayer and teardownSyncLayer do not throw on web", () => {
    initSyncLayer();
    teardownSyncLayer();
  });

  it("clearWebOutbox clears store", async () => {
    clearWebOutbox();
    await vi.waitFor(() => expect(mockGetCounts).toHaveBeenCalled());
  });
});
