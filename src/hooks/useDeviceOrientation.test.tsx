import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDeviceOrientation", () => {
  it("listens to deviceorientation when permission granted", async () => {
    class DO extends Event {
      declare alpha: number | null;
      declare beta: number | null;
      declare gamma: number | null;
      declare absolute: boolean;
      constructor(type: string) {
        super(type);
        this.alpha = 1;
        this.beta = 2;
        this.gamma = 3;
        this.absolute = true;
      }
    }
    vi.stubGlobal("DeviceOrientationEvent", DO);

    const listeners: ((e: Event) => void)[] = [];
    vi.spyOn(window, "addEventListener").mockImplementation((type, fn) => {
      if (type === "deviceorientation" && typeof fn === "function") {
        listeners.push(fn as (e: Event) => void);
      }
    });
    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.supported).toBe(true);
    expect(result.current.permission).toBe("granted");

    const ev = new DO("deviceorientation");
    act(() => {
      for (const fn of listeners) fn(ev);
    });
    expect(result.current.reading).toEqual({
      alpha: 1,
      beta: 2,
      gamma: 3,
      absolute: true,
    });
  });

  it("reading unchanged when enabled false", () => {
    class DO extends Event {}
    vi.stubGlobal("DeviceOrientationEvent", DO);
    const { result } = renderHook(() =>
      useDeviceOrientation({ enabled: false }),
    );
    expect(result.current.reading).toBeNull();
  });
});
