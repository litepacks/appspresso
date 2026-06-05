import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPlatform = vi.hoisted(() => vi.fn(() => "web"));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => mockGetPlatform(),
  },
}));

const sx = vi.hoisted(() => ({
  createConnection: vi.fn(),
  open: vi.fn(),
  execute: vi.fn(),
  query: vi.fn(),
  run: vi.fn(),
  close: vi.fn(),
  closeConnection: vi.fn(),
  deleteDatabase: vi.fn(),
}));

vi.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: sx,
}));

const runMigrations = vi.hoisted(() => vi.fn().mockResolvedValue(2));

vi.mock("@/db/migrate", () => ({
  runMigrations,
}));

import {
  closeDatabase,
  getSetting,
  initDatabase,
  isSqliteOpen,
  resetDatabaseMigrations,
  setSetting,
} from "@/db/sqlite";
import { logger } from "@/lib/logger";

describe("sqlite", () => {
  const setStatus = vi.fn();

  beforeEach(() => {
    mockGetPlatform.mockReturnValue("web");
    setStatus.mockClear();
    sx.createConnection.mockReset();
    sx.open.mockReset();
    sx.execute.mockReset();
    sx.query.mockReset();
    sx.run.mockReset();
    sx.close.mockReset();
    sx.closeConnection.mockReset();
    sx.deleteDatabase.mockReset();
    vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.spyOn(logger, "warn").mockImplementation(() => {});
  });

  afterEach(async () => {
    mockGetPlatform.mockReturnValue("ios");
    await closeDatabase();
    mockGetPlatform.mockReturnValue("web");
    vi.restoreAllMocks();
  });

  it("initDatabase marks unavailable on web", async () => {
    mockGetPlatform.mockReturnValue("web");
    await initDatabase(setStatus);
    expect(setStatus).toHaveBeenCalledWith({
      available: false,
      messageKey: "sqlite.webUnavailable",
    });
  });

  it("initDatabase opens DB and runs migrations on native", async () => {
    mockGetPlatform.mockReturnValue("ios");
    sx.createConnection.mockResolvedValue(undefined);
    sx.open.mockResolvedValue(undefined);
    sx.execute.mockResolvedValue(undefined);

    await initDatabase(setStatus);

    expect(sx.createConnection).toHaveBeenCalled();
    expect(runMigrations).toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith({ available: true });

    sx.query.mockResolvedValue({ values: [["hello"]] });
    expect(await getSetting("k")).toBe("hello");

    await setSetting("k", "v");
    expect(sx.run).toHaveBeenCalled();

    sx.close.mockResolvedValue(undefined);
    sx.closeConnection.mockResolvedValue(undefined);
    await closeDatabase();
    expect(isSqliteOpen()).toBe(false);
  });

  it("initDatabase sets error state when native setup fails", async () => {
    mockGetPlatform.mockReturnValue("android");
    sx.createConnection.mockRejectedValue(new Error("nope"));

    await initDatabase(setStatus);

    expect(setStatus).toHaveBeenCalledWith({
      available: false,
      messageKey: "sqlite.error",
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it("closeDatabase warns when close throws but clears opened", async () => {
    mockGetPlatform.mockReturnValue("ios");
    sx.createConnection.mockResolvedValue(undefined);
    sx.open.mockResolvedValue(undefined);
    sx.execute.mockResolvedValue(undefined);
    await initDatabase(setStatus);

    sx.close.mockRejectedValue(new Error("close"));
    await closeDatabase();
    expect(logger.warn).toHaveBeenCalled();
    expect(isSqliteOpen()).toBe(false);
  });

  it("resetDatabaseMigrations deletes DB on native and re-inits", async () => {
    mockGetPlatform.mockReturnValue("ios");
    sx.createConnection.mockResolvedValue(undefined);
    sx.open.mockResolvedValue(undefined);
    sx.execute.mockResolvedValue(undefined);
    sx.close.mockResolvedValue(undefined);
    sx.closeConnection.mockResolvedValue(undefined);
    sx.deleteDatabase.mockResolvedValue(undefined);

    await initDatabase(setStatus);
    await resetDatabaseMigrations(setStatus);

    expect(sx.deleteDatabase).toHaveBeenCalled();
    expect(sx.createConnection.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
