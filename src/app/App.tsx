import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AppspressoBootstrapGate } from "@/app/AppspressoBootstrapGate";
import { GlobalErrorListeners } from "@/app/GlobalErrorListeners";
import { AppspressoRootProviders } from "@/app/RootProviders";
import { router } from "@/app/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFallback } from "@/components/LoadingFallback";
import { DevToolsMount } from "@/dev/DevToolsMount";

export default function App() {
  return (
    <ErrorBoundary>
      <GlobalErrorListeners />
      <AppspressoRootProviders>
        <AppspressoBootstrapGate>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
          <DevToolsMount />
        </AppspressoBootstrapGate>
      </AppspressoRootProviders>
    </ErrorBoundary>
  );
}
