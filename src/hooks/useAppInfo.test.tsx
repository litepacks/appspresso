import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { useAppInfo } from "@/hooks/useAppInfo";

vi.mock("@/build/injected-app-meta", () => ({
  getInjectedAppMeta: vi.fn(),
}));

import { getInjectedAppMeta } from "@/build/injected-app-meta";

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe("useAppInfo", () => {
  beforeEach(() => {
    vi.mocked(getInjectedAppMeta).mockReturnValue({
      displayName: "Hook Test",
      id: "com.hook.test",
    });
  });

  it("atom and meta merge", () => {
    const { result } = renderHook(() => useAppInfo(), { wrapper });
    expect(result.current.displayName).toBe("Hook Test");
    expect(result.current.appId).toBe("com.hook.test");
    expect(result.current.version).toBeTruthy();
  });
});
