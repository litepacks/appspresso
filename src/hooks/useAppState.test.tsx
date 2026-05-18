import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { useAppState } from "@/hooks/useAppState";

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe("useAppState", () => {
  it("returns app lifecycle slice from atom", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.isActive).toBe(true);
    expect(result.current.source).toBe("web");
    expect(result.current.state).toBe("active");
  });
});
