import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe("useNetworkStatus", () => {
  it("returns atom slice after listeners init", () => {
    const { result } = renderHook(() => useNetworkStatus(), { wrapper });
    expect(result.current).toHaveProperty("connected");
    expect(result.current).toHaveProperty("connectionType");
  });
});
