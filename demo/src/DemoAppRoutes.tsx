import { Suspense } from "react";
import { LoadingFallback } from "appspresso/components/LoadingFallback";
import { DemoRouterProvider } from "./demo-router";
import { VocabStudyPersistence } from "./vocab/VocabStudyPersistence";

/** Router + vocab persistence — separate chunk from provider shell. */
export function DemoAppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <VocabStudyPersistence>
          <DemoRouterProvider />
        </VocabStudyPersistence>
      </div>
    </Suspense>
  );
}
