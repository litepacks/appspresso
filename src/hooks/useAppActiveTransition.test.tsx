import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { useAppActiveTransition } from "@/hooks/useAppActiveTransition";
import { appLifecycleAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe("useAppActiveTransition", () => {
  afterEach(() => {
    appStore.set(appLifecycleAtom, {
      state: "active",
      isActive: true,
      source: "web",
    });
  });

  it("aktiften arka plana onBackground", async () => {
    const onBackground = vi.fn();
    renderHook(
      () =>
        useAppActiveTransition({
          onBackground,
        }),
      { wrapper },
    );

    appStore.set(appLifecycleAtom, {
      state: "background",
      isActive: false,
      source: "native",
    });

    await waitFor(() => expect(onBackground).toHaveBeenCalledTimes(1));
  });

  it("onForeground from background", async () => {
    appStore.set(appLifecycleAtom, {
      state: "background",
      isActive: false,
      source: "native",
    });
    const onForeground = vi.fn();
    renderHook(
      () =>
        useAppActiveTransition({
          onForeground,
        }),
      { wrapper },
    );

    appStore.set(appLifecycleAtom, {
      state: "active",
      isActive: true,
      source: "native",
    });

    await waitFor(() => expect(onForeground).toHaveBeenCalledTimes(1));
  });

  it("does not fire when enabled false", async () => {
    const onBackground = vi.fn();
    renderHook(
      () =>
        useAppActiveTransition({
          onBackground,
          enabled: false,
        }),
      { wrapper },
    );
    appStore.set(appLifecycleAtom, {
      state: "background",
      isActive: false,
      source: "web",
    });
    await new Promise((r) => setTimeout(r, 30));
    expect(onBackground).not.toHaveBeenCalled();
  });
});
