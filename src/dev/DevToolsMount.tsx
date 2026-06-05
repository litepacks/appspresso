import { lazy, Suspense } from "react";
import { isNativeDebugEnabled } from "@/lib/native-debug";

const LazyDebugPanel = lazy(async () => {
  const { DebugPanel } = await import("@/dev/DebugPanel");
  return { default: DebugPanel };
});

/** DEV or `VITE_NATIVE_DEBUG=true`, unless `VITE_ENABLE_DEBUG_PANEL` is `"false"`. */
export function DevToolsMount() {
  if (!isNativeDebugEnabled()) return null;
  if (import.meta.env.VITE_ENABLE_DEBUG_PANEL === "false") return null;
  return (
    <Suspense fallback={null}>
      <LazyDebugPanel />
    </Suspense>
  );
}
