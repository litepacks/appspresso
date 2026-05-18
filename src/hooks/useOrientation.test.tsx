import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOrientation } from "./useOrientation";

describe("useOrientation", () => {
  it("returns portrait when matchMedia portrait", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("portrait"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { result } = renderHook(() => useOrientation());
    expect(result.current.kind).toBe("portrait");
    vi.unstubAllGlobals();
  });
});
