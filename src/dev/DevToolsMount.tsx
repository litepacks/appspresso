import { lazy, Suspense } from "react";

const LazyDebugPanel = lazy(async () => {
  const { DebugPanel } = await import("@/dev/DebugPanel");
  return { default: DebugPanel };
});

/** In DEV, shown unless `VITE_ENABLE_DEBUG_PANEL` is the string `"false"`. */
export function DevToolsMount() {
  if (!import.meta.env.DEV) return null;
  if (import.meta.env.VITE_ENABLE_DEBUG_PANEL === "false") return null;
  return (
    <Suspense fallback={null}>
      <LazyDebugPanel />
    </Suspense>
  );
}
