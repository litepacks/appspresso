import { Capacitor } from "@capacitor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { initNotificationBridge } from "@/services/init-notifications.service";

describe("initNotificationBridge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns no-op disposer on web", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
    const dispose = await initNotificationBridge();
    await expect(dispose()).resolves.toBeUndefined();
  });
});
