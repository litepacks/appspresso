import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StoreProvider } from "@/app/providers/StoreProvider";
import {
  useAppBackground,
  useIsAppInBackground,
} from "@/hooks/useAppBackground";
import { appLifecycleAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe("useIsAppInBackground", () => {
  afterEach(() => {
    appStore.set(appLifecycleAtom, {
      state: "active",
      isActive: true,
      source: "web",
    });
  });

  it("true when isActive false", () => {
    appStore.set(appLifecycleAtom, {
      state: "background",
      isActive: false,
      source: "native",
    });
    const { result } = renderHook(() => useIsAppInBackground(), { wrapper });
    expect(result.current).toBe(true);
  });

  it("aktifken false", () => {
    const { result } = renderHook(() => useIsAppInBackground(), { wrapper });
    expect(result.current).toBe(false);
  });
});

describe("useAppBackground", () => {
  afterEach(() => {
    appStore.set(appLifecycleAtom, {
      state: "active",
      isActive: true,
      source: "web",
    });
  });

  it("same edge as useAppActiveTransition", async () => {
    const onBackground = vi.fn();
    renderHook(() => useAppBackground({ onBackground }), { wrapper });

    appStore.set(appLifecycleAtom, {
      state: "background",
      isActive: false,
      source: "web",
    });

    await waitFor(() => expect(onBackground).toHaveBeenCalledTimes(1));
  });
});
