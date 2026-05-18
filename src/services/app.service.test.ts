import { afterEach, describe, expect, it, vi } from "vitest";
import { appLifecycleAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const isNative = vi.hoisted(() => vi.fn(() => false));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNative(),
    getPlatform: () => (isNative() ? "android" : "web"),
  },
}));

const mockAddListener = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (...args: unknown[]) => mockAddListener(...args),
    getLaunchUrl: vi.fn(),
    minimizeApp: vi.fn().mockResolvedValue(undefined),
  },
}));

import { logger } from "@/lib/logger";
import { initAppLifecycle, teardownAppLifecycle } from "@/services/app.service";

describe("app.service", () => {
  afterEach(async () => {
    isNative.mockReturnValue(false);
    mockAddListener.mockReset();
    await teardownAppLifecycle();
    vi.restoreAllMocks();
  });

  it("web: syncs appLifecycleAtom from visibilitychange", async () => {
    isNative.mockReturnValue(false);
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });

    await initAppLifecycle();
    expect(appStore.get(appLifecycleAtom)).toMatchObject({
      source: "web",
      isActive: true,
      state: "active",
    });

    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(appStore.get(appLifecycleAtom)).toMatchObject({
      state: "background",
      isActive: false,
      source: "web",
    });
  });

  it("native: registers listeners and teardown removes them", async () => {
    isNative.mockReturnValue(true);
    const remove = vi.fn().mockResolvedValue(undefined);
    mockAddListener
      .mockResolvedValueOnce({ remove })
      .mockResolvedValueOnce({ remove });

    await initAppLifecycle();
    expect(mockAddListener).toHaveBeenCalled();
    await teardownAppLifecycle();
    expect(remove.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("android: backButton listener history.back when stack empty and canGoBack", async () => {
    isNative.mockReturnValue(true);
    const remove = vi.fn().mockResolvedValue(undefined);
    mockAddListener
      .mockResolvedValueOnce({ remove })
      .mockResolvedValueOnce({ remove });

    await initAppLifecycle();
    const backEntry = mockAddListener.mock.calls.find(
      (c) => c[0] === "backButton",
    );
    expect(backEntry).toBeDefined();
    const onBack = backEntry?.[1] as (e: { canGoBack: boolean }) => void;
    const hist = vi.spyOn(window.history, "back").mockImplementation(() => {});

    onBack({ canGoBack: true });
    expect(hist).toHaveBeenCalledOnce();

    hist.mockRestore();
  });

  it("teardown logs when listener remove throws", async () => {
    isNative.mockReturnValue(true);
    const debug = vi.spyOn(logger, "debug").mockImplementation(() => {});
    mockAddListener.mockResolvedValue({
      remove: async () => {
        throw new Error("remove failed");
      },
    });

    await initAppLifecycle();
    await teardownAppLifecycle();
    expect(debug).toHaveBeenCalled();
    debug.mockRestore();
  });
});
