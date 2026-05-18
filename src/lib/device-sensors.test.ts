import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDeviceMotionPermissionHint,
  getDeviceOrientationPermissionHint,
  requestDeviceMotionPermission,
  requestDeviceOrientationPermission,
} from "@/lib/device-sensors";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("device-sensors", () => {
  it("unsupported when DeviceOrientationEvent missing", () => {
    vi.stubGlobal(
      "DeviceOrientationEvent",
      undefined as unknown as typeof DeviceOrientationEvent,
    );
    expect(getDeviceOrientationPermissionHint()).toBe("unsupported");
  });

  it("treats as granted when requestPermission missing", () => {
    class DO extends Event {
      declare alpha: number | null;
    }
    vi.stubGlobal("DeviceOrientationEvent", DO);
    expect(getDeviceOrientationPermissionHint()).toBe("granted");
  });

  it("requestOrientationPermission true without static method", async () => {
    class DO extends Event {}
    vi.stubGlobal("DeviceOrientationEvent", DO);
    await expect(requestDeviceOrientationPermission()).resolves.toBe(true);
  });

  it("requestMotionPermission false when denied", async () => {
    class DM extends Event {
      static requestPermission() {
        return Promise.resolve("denied" as const);
      }
    }
    vi.stubGlobal("DeviceMotionEvent", DM);
    await expect(requestDeviceMotionPermission()).resolves.toBe(false);
    expect(getDeviceMotionPermissionHint()).toBe("prompt");
  });
});
