import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isGeolocationSupported,
  useNativeLocation,
} from "@/hooks/useNativeLocation";

function mockPosition(lat: number, lon: number): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lon,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON() {
        return this;
      },
    },
    timestamp: Date.now(),
    toJSON() {
      return this;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isGeolocationSupported", () => {
  it("false when geolocation missing", () => {
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      geolocation: undefined,
    } as Navigator);
    expect(isGeolocationSupported()).toBe(false);
  });
});

describe("useNativeLocation", () => {
  it("gets location via refresh", async () => {
    const watchPosition = vi.fn();
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success(mockPosition(41.01, 28.98));
    });
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        geolocation: { getCurrentPosition, watchPosition },
      }),
    );

    const { result } = renderHook(() =>
      useNativeLocation({ requestOnMount: false }),
    );

    let snap: Awaited<ReturnType<typeof result.current.refresh>>;
    await act(async () => {
      snap = await result.current.refresh();
    });
    expect(snap.coords.latitude).toBe(41.01);
    expect(snap.coords.longitude).toBe(28.98);
    expect(result.current.error).toBeNull();
  });

  it("calls getCurrentPosition by default with requestOnMount", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success(mockPosition(1, 2));
    });
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        geolocation: {
          getCurrentPosition,
          watchPosition: vi.fn(),
          clearWatch: vi.fn(),
        },
      }),
    );

    renderHook(() => useNativeLocation());
    await waitFor(() => {
      expect(getCurrentPosition).toHaveBeenCalled();
    });
  });

  it("clears via clearWatch in watch mode", async () => {
    const clearWatch = vi.fn();
    const watchPosition = vi.fn((_success, _error, _opts) => 42);
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        geolocation: {
          getCurrentPosition: vi.fn(),
          watchPosition,
          clearWatch,
        },
      }),
    );

    const { unmount } = renderHook(() =>
      useNativeLocation({ watch: true, requestOnMount: false }),
    );
    expect(watchPosition).toHaveBeenCalled();
    unmount();
    expect(clearWatch).toHaveBeenCalledWith(42);
  });

  it("refresh rejects when unsupported", async () => {
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      geolocation: undefined,
    } as Navigator);

    const { result } = renderHook(() =>
      useNativeLocation({ requestOnMount: false }),
    );
    expect(result.current.supported).toBe(false);
    await expect(act(() => result.current.refresh())).rejects.toThrow(
      /not supported/,
    );
  });
});
