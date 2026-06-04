import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import { webOutboxList } from "./web-outbox";

const httpPost = vi.hoisted(() => vi.fn());
const mockIsSqliteOpen = vi.hoisted(() => vi.fn(() => false));
const mockGetPlatform = vi.hoisted(() => vi.fn(() => "web"));
const sqliteRun = vi.hoisted(() => vi.fn());
const sqliteQuery = vi.hoisted(() => vi.fn());

vi.mock("@/api/http", () => ({
  http: { post: httpPost },
}));

vi.mock("@/db/sqlite", () => ({
  isSqliteOpen: mockIsSqliteOpen,
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: mockGetPlatform,
    isNativePlatform: () => mockGetPlatform() !== "web",
  },
}));

vi.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: {
    run: sqliteRun,
    query: sqliteQuery,
  },
}));

const {
  clearWebOutbox,
  enqueueMutationLikeOperation,
  flushNativePendingBuffer,
  flushOutbox,
  initSyncLayer,
  teardownSyncLayer,
} = await import("./sync.service");

function resetSyncTestState() {
  teardownSyncLayer();
  clearWebOutbox();
  localStorage.clear();
  mockIsSqliteOpen.mockReturnValue(false);
  mockGetPlatform.mockReturnValue("web");
  httpPost.mockReset();
  sqliteRun.mockReset();
  sqliteQuery.mockReset();
  appStore.set(syncStatusAtom, { pendingCount: 0, isFlushing: false });
}

describe("sync.service", () => {
  beforeEach(() => {
    vi.useRealTimers();
    resetSyncTestState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetSyncTestState();
  });

  it("web: enqueue updates pending count and flush posts then clears outbox", async () => {
    mockGetPlatform.mockReturnValue("web");
    httpPost.mockResolvedValue({ status: 200 });

    enqueueMutationLikeOperation({
      operation: "demo",
      payload: { path: "/api/demo", body: 1 },
    });
    expect(appStore.get(syncStatusAtom).pendingCount).toBe(1);

    await flushOutbox();
    expect(httpPost).toHaveBeenCalledWith(
      "/api/demo",
      expect.objectContaining({ path: "/api/demo", body: 1 }),
      expect.objectContaining({ timeout: 5000 }),
    );
    expect(appStore.get(syncStatusAtom).pendingCount).toBe(0);
    expect(appStore.get(syncStatusAtom).isFlushing).toBe(false);
  });

  it("web: flush failure re-enqueues and sets lastError", async () => {
    mockGetPlatform.mockReturnValue("web");
    httpPost.mockRejectedValue(new Error("boom"));

    enqueueMutationLikeOperation({
      operation: "demo",
      payload: { path: "/api/x" },
    });
    await flushOutbox();

    expect(appStore.get(syncStatusAtom).lastError).toContain("boom");
    expect(webOutboxList().length).toBe(1);
  });

  it("web: chained scheduled flush runs with fake timers", async () => {
    mockGetPlatform.mockReturnValue("web");
    vi.useFakeTimers();
    httpPost.mockResolvedValue({ status: 200 });

    enqueueMutationLikeOperation({
      operation: "a",
      payload: { path: "/api/a" },
    });
    enqueueMutationLikeOperation({
      operation: "b",
      payload: { path: "/api/b" },
    });
    expect(appStore.get(syncStatusAtom).pendingCount).toBe(2);

    const first = flushOutbox();
    await vi.runOnlyPendingTimersAsync();
    await first;

    expect(httpPost.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(appStore.get(syncStatusAtom).pendingCount).toBe(0);
  });

  it("native: flush posts, deletes row, and flushes until empty", async () => {
    mockGetPlatform.mockReturnValue("ios");
    mockIsSqliteOpen.mockReturnValue(true);
    httpPost.mockResolvedValue({ status: 200 });
    vi.useFakeTimers();

    sqliteQuery
      .mockResolvedValueOnce({
        values: [[1, JSON.stringify({ path: "/api/n", v: 1 })]],
      })
      .mockResolvedValueOnce({ values: [[0]] })
      .mockResolvedValueOnce({ values: [] });

    await flushOutbox();
    await vi.runAllTimersAsync();

    expect(httpPost).toHaveBeenCalledWith(
      "/api/n",
      expect.objectContaining({ path: "/api/n", v: 1 }),
      expect.objectContaining({ timeout: 5000 }),
    );
    expect(sqliteRun).toHaveBeenCalled();
    expect(appStore.get(syncStatusAtom).pendingCount).toBe(0);
  });

  it("native: buffers enqueue when SQLite is not open yet", async () => {
    mockGetPlatform.mockReturnValue("ios");
    mockIsSqliteOpen.mockReturnValue(false);

    enqueueMutationLikeOperation({
      operation: "buf",
      payload: { path: "/api/buf" },
    });

    expect(appStore.get(syncStatusAtom).pendingCount).toBe(1);
    expect(sqliteRun).not.toHaveBeenCalled();
  });

  it("native: flushNativePendingBuffer drains buffer after DB opens", async () => {
    mockGetPlatform.mockReturnValue("ios");
    mockIsSqliteOpen.mockReturnValue(false);

    enqueueMutationLikeOperation({
      operation: "buf",
      payload: { path: "/api/buf2" },
    });

    mockIsSqliteOpen.mockReturnValue(true);
    sqliteRun.mockResolvedValue({});
    await flushNativePendingBuffer();

    expect(sqliteRun).toHaveBeenCalledWith(
      expect.objectContaining({
        statement: expect.stringContaining("INSERT INTO sync_outbox"),
      }),
    );
  });

  it("native: http failure marks row failed and sets lastError", async () => {
    mockGetPlatform.mockReturnValue("android");
    mockIsSqliteOpen.mockReturnValue(true);
    httpPost.mockRejectedValue(new Error("native-offline"));

    sqliteQuery
      .mockResolvedValueOnce({
        values: [[7, JSON.stringify({ path: "/api/z" })]],
      })
      .mockResolvedValueOnce({ values: [[2]] });

    await flushOutbox();

    expect(appStore.get(syncStatusAtom).lastError).toContain("native-offline");
    expect(sqliteRun).toHaveBeenCalledWith(
      expect.objectContaining({
        statement: expect.stringContaining("UPDATE sync_outbox"),
      }),
    );
  });

  it("initSyncLayer and teardownSyncLayer do not throw on web", () => {
    mockGetPlatform.mockReturnValue("web");
    initSyncLayer();
    teardownSyncLayer();
  });
});
