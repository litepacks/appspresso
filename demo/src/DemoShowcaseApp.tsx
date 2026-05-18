import { AppLifecycleSync } from "appspresso/app/AppLifecycleSync";
import { AppspressoBootstrapGate } from "appspresso/app/AppspressoBootstrapGate";
import { GlobalErrorListeners } from "appspresso/app/GlobalErrorListeners";
import { getInjectedAppMeta } from "appspresso/build/injected-app-meta";
import type { AppspressoRootProvidersProps } from "appspresso/app/RootProviders";
import { AppspressoRootProviders } from "appspresso/app/RootProviders";
import { ErrorBoundary } from "appspresso/components/ErrorBoundary";
import { LoadingFallback } from "appspresso/components/LoadingFallback";
import { DevToolsMount } from "appspresso/dev/DevToolsMount";
import { Suspense, useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { demoMockAuthAdapter } from "./demo-mock-auth";
import { demoRouter } from "./demo-router";
import { VocabStudyPersistence } from "./vocab/VocabStudyPersistence";

export type DemoShowcaseAppProps = Partial<
  Pick<AppspressoRootProvidersProps, "omit" | "authAdapter" | "filesystemConfig">
>;

export function DemoShowcaseApp({
  omit,
  authAdapter = demoMockAuthAdapter,
  filesystemConfig: filesystemConfigProp,
}: DemoShowcaseAppProps = {}) {
  const filesystemConfig = useMemo(
    () => filesystemConfigProp ?? getInjectedAppMeta()?.filesystem,
    [filesystemConfigProp],
  );

  return (
    <ErrorBoundary>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <GlobalErrorListeners />
        <AppLifecycleSync />
        <AppspressoRootProviders
          omit={omit}
          authAdapter={authAdapter}
          filesystemConfig={filesystemConfig}
        >
          <AppspressoBootstrapGate>
            <Suspense fallback={<LoadingFallback />}>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <VocabStudyPersistence>
                  <RouterProvider router={demoRouter} />
                </VocabStudyPersistence>
              </div>
            </Suspense>
            <DevToolsMount />
          </AppspressoBootstrapGate>
        </AppspressoRootProviders>
      </div>
    </ErrorBoundary>
  );
}
