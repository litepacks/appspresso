import { HostAppFrame } from "appspresso/app/HostAppFrame";
import { AppspressoBootstrapGate } from "appspresso/app/AppspressoBootstrapGate";
import { StoreProvider } from "appspresso/app/providers/StoreProvider";
import type { AppspressoViteHostConfig } from "appspresso/build/inject-env";
import { lazy, Suspense, useEffect } from "react";
import { DemoShellLoading } from "./DemoShellLoading";
import { preloadDemoAppChunks } from "./preload-demo-app";

const DemoAppContent = lazy(() =>
  import("./DemoAppContent").then((m) => ({ default: m.DemoAppContent })),
);

export type DemoBootstrapShellProps = {
  host: Pick<AppspressoViteHostConfig, "hostBanner" | "mount">;
};

/**
 * Minimal native entry: store + bootstrap gate only.
 * Router, providers, and showcase routes load after bootstrap reaches `exiting`.
 */
export function DemoBootstrapShell({ host }: DemoBootstrapShellProps) {
  useEffect(() => {
    preloadDemoAppChunks();
  }, []);

  return (
    <HostAppFrame host={host}>
      <StoreProvider>
        <AppspressoBootstrapGate>
          <Suspense fallback={<DemoShellLoading />}>
            <DemoAppContent />
          </Suspense>
        </AppspressoBootstrapGate>
      </StoreProvider>
    </HostAppFrame>
  );
}
