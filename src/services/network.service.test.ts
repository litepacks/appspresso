import { Capacitor } from "@capacitor/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  initNetworkListeners,
  refreshNetworkStatus,
} from "@/services/network.service";
import { onOfflineEnter } from "@/services/offline-mode.service";
import { networkStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

describe("network.service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    appStore.set(networkStatusAtom, {
      connected: true,
      connectionType: "unknown",
    });
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
  });

  it("refreshNetworkStatus mirrors navigator.onLine on web", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await refreshNetworkStatus();
    expect(appStore.get(networkStatusAtom)).toMatchObject({
      connected: false,
      connectionType: "web",
    });
  });

  it("refreshNetworkStatus triggers offline listeners when going offline", async () => {
    const fn = vi.fn();
    const unsub = onOfflineEnter(fn);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await refreshNetworkStatus();
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("initNetworkListeners registers and cleans up window listeners", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const unsub = initNetworkListeners();
    expect(add).toHaveBeenCalledWith("online", expect.any(Function));
    unsub();
    expect(remove).toHaveBeenCalledWith("online", expect.any(Function));
  });
});
