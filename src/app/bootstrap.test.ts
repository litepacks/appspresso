import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrapStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const initAppearance = vi.hoisted(() => vi.fn());
const initDatabase = vi.hoisted(() => vi.fn());
const initSyncLayer = vi.hoisted(() => vi.fn());
const loadRuntimeConfig = vi.hoisted(() => vi.fn());
const reportError = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: () => "web" },
}));

vi.mock("@/config", () => ({
  getEnvConfig: vi.fn(),
  getFeatureFlags: vi.fn(() => ({})),
  loadRuntimeConfig,
}));

vi.mock("@/services/appearance.service", () => ({
  initAppearance,
}));

vi.mock("@/db/sqlite", () => ({
  initDatabase,
}));

vi.mock("@/sync/sync.service", () => ({
  initSyncLayer,
  flushNativePendingBuffer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/telemetry.service", () => ({
  initTelemetry: vi.fn(),
}));

vi.mock("@/lib/reportError", () => ({
  reportError,
}));

describe("runBootstrap", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    appStore.set(bootstrapStatusAtom, { phase: "idle" });
  });

  it("sets bootstrapStatusAtom to ready on success", async () => {
    initAppearance.mockResolvedValue(undefined);
    initDatabase.mockResolvedValue(undefined);
    loadRuntimeConfig.mockResolvedValue(undefined);

    const { runBootstrap } = await import("./bootstrap");
    await runBootstrap();

    expect(appStore.get(bootstrapStatusAtom)).toEqual({ phase: "ready" });
  });

  it("sets failed state and rethrows when initAppearance fails", async () => {
    initAppearance.mockRejectedValue(new Error("appearance boom"));
    loadRuntimeConfig.mockResolvedValue(undefined);

    const { runBootstrap } = await import("./bootstrap");
    await expect(runBootstrap()).rejects.toThrow("appearance boom");

    expect(appStore.get(bootstrapStatusAtom)).toEqual({
      phase: "failed",
      error: "appearance boom",
    });
    expect(reportError).toHaveBeenCalled();
  });
});
