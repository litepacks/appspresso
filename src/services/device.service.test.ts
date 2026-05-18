import { Capacitor } from "@capacitor/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refreshDeviceInfo } from "@/services/device.service";
import { deviceInfoAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

describe("refreshDeviceInfo", () => {
  beforeEach(() => {
    appStore.set(deviceInfoAtom, { platform: "web" });
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets web profile when not native", async () => {
    await refreshDeviceInfo();
    const slice = appStore.get(deviceInfoAtom);
    expect(slice.platform).toBe("web");
    expect(slice.model).toBeDefined();
  });
});
