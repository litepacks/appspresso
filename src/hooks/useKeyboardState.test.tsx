import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useKeyboardState } from "@/hooks/useKeyboardState";

describe("useKeyboardState", () => {
  it("closed and height 0 when enabled false", () => {
    const { result } = renderHook(() => useKeyboardState({ enabled: false }));
    expect(result.current).toEqual({ isOpen: false, height: 0 });
  });

  it("returns without error when enabled true", () => {
    const { result } = renderHook(() => useKeyboardState({ enabled: true }));
    expect(result.current).toHaveProperty("isOpen");
    expect(result.current).toHaveProperty("height");
  });
});
