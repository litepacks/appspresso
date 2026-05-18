import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBackgroundRunner } from "@/hooks/useBackgroundRunner";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => "web",
  },
}));

describe("useBackgroundRunner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("web’de available false", async () => {
    const { result } = renderHook(() => useBackgroundRunner());
    await waitFor(() => {
      expect(result.current.available).toBe(false);
    });
    expect(result.current.isNative).toBe(false);
  });
});
