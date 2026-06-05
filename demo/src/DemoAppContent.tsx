import { AppLifecycleSync } from "appspresso/app/AppLifecycleSync";
import { GlobalErrorListeners } from "appspresso/app/GlobalErrorListeners";
import type { AppspressoRootProvidersProps } from "appspresso/app/RootProviders";
import { AppspressoRootProviders } from "appspresso/app/RootProviders";
import { ErrorBoundary } from "appspresso/components/ErrorBoundary";
import { LoadingFallback } from "appspresso/components/LoadingFallback";
import { Suspense, lazy, useMemo } from "react";
import { getInjectedAppMeta } from "appspresso/build/injected-app-meta";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary";
import { demoMockAuthAdapter } from "./demo-mock-auth";
import { applyDemoLocales } from "./loadDemoLocales";

const DemoAppRoutes = lazy(() =>
  import("./DemoAppRoutes").then((m) => ({ default: m.DemoAppRoutes })),
);

const DevToolsMount = lazy(() =>
  import("appspresso/dev/DevToolsMount").then((m) => ({
    default: m.DevToolsMount,
  })),
);

// Provider tree may re-import `@/i18n` and call init() — re-merge demo namespace after imports.
applyDemoLocales();

export type DemoAppContentProps = Partial<
  Pick<
    AppspressoRootProvidersProps,
    "omit" | "authAdapter" | "filesystemConfig"
  >
>;

export function DemoAppContent({
  omit,
  authAdapter = demoMockAuthAdapter,
  filesystemConfig: filesystemConfigProp,
}: DemoAppContentProps = {}) {
  const filesystemConfig = useMemo(
    () => filesystemConfigProp ?? getInjectedAppMeta()?.filesystem,
    [filesystemConfigProp],
  );
  const resolvedOmit = useMemo(
    () =>
      [
        ...new Set([
          ...(omit ?? []),
          "store" as const,
          "revenueCat" as const,
        ]),
      ] as AppspressoRootProvidersProps["omit"],
    [omit],
  );

  return (
    <GlobalErrorBoundary>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <GlobalErrorListeners />
        <AppLifecycleSync />
        <AppspressoRootProviders
          omit={resolvedOmit}
          authAdapter={authAdapter}
          filesystemConfig={filesystemConfig}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <DemoAppRoutes />
            </Suspense>
          </ErrorBoundary>
          <Suspense fallback={null}>
            <DevToolsMount />
          </Suspense>
        </AppspressoRootProviders>
      </div>
    </GlobalErrorBoundary>
  );
}
