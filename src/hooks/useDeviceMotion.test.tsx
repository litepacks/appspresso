import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDeviceMotion", () => {
  it("listens to devicemotion when granted", async () => {
    class DM extends Event {
      declare acceleration: DeviceMotionEvent["acceleration"];
      declare accelerationIncludingGravity: DeviceMotionEvent["accelerationIncludingGravity"];
      declare rotationRate: DeviceMotionEvent["rotationRate"];
      declare interval: number;
      constructor(type: string) {
        super(type);
        this.acceleration = {
          x: 0.1,
          y: 0.2,
          z: 0.3,
          toJSON() {
            return this;
          },
        };
        this.accelerationIncludingGravity = null;
        this.rotationRate = null;
        this.interval = 16;
      }
    }
    vi.stubGlobal("DeviceMotionEvent", DM);

    const listeners: ((e: Event) => void)[] = [];
    vi.spyOn(window, "addEventListener").mockImplementation((type, fn) => {
      if (type === "devicemotion" && typeof fn === "function") {
        listeners.push(fn as (e: Event) => void);
      }
    });
    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});

    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.permission).toBe("granted");

    const ev = new DM("devicemotion");
    act(() => {
      for (const fn of listeners) fn(ev);
    });
    expect(result.current.reading?.acceleration).toEqual({
      x: 0.1,
      y: 0.2,
      z: 0.3,
    });
    expect(result.current.reading?.interval).toBe(16);
  });
});
