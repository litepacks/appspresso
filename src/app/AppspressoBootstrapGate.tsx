import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { BootstrapFailureScreen } from "@/app/BootstrapFailureScreen";
import { BootstrapLoadingScreen } from "@/app/BootstrapLoadingScreen";
import { BootstrapStuckDetector } from "@/app/BootstrapStuckDetector";
import { NativeBootOverlay } from "@/dev/NativeBootOverlay";
import { useAppspressoBootstrapState } from "@/hooks/useAppspressoBootstrap";
import { getSplashBootstrapTiming } from "@/lib/splash-bootstrap";

const easeOut = "cubic-bezier(0.22, 1, 0.36, 1)";

// Reduced motion preference via media query (no hook = no motion import)
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type AppspressoBootstrapGateProps = {
  children: ReactNode;
  /** Fires once when bootstrap reaches `ready` (for plugin `onAppReady`). */
  onReady?: () => void | Promise<void>;
};

/**
 * Bootstrap splash → main app: cross-fade on exit (splash on top, content fades in below).
 * Usable inside or outside `AppspressoRootProviders`; keeps demo providers above.
 * CSS-only transitions (no motion library) to keep bundle minimal.
 */
export function AppspressoBootstrapGate({
  children,
  onReady,
}: AppspressoBootstrapGateProps) {
  const { phase, error, retry, startedAt } = useAppspressoBootstrapState();
  const readyNotified = useRef(false);

  useEffect(() => {
    if (phase !== "ready" || !onReady || readyNotified.current) return;
    readyNotified.current = true;
    void Promise.resolve(onReady()).catch((e) => {
      console.error("AppspressoBootstrapGate onReady failed", e);
    });
  }, [phase, onReady]);

  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const reduceMotion = useMemo(() => prefersReducedMotion(), [phase]);
  const exitMs = timing.exitDurationMs;

  const showSplash = phase !== "ready";
  const mountApp = phase === "exiting" || phase === "ready";

  if (phase === "failed" && error) {
    return <BootstrapFailureScreen error={error} onRetry={retry} />;
  }

  if (phase === "loading") {
    return <BootstrapLoadingScreen />;
  }

  const transitionStyle: React.CSSProperties = {
    opacity: phase === "ready" ? 1 : 0,
    transitionProperty: "opacity",
    transitionDuration: reduceMotion ? "0ms" : `${exitMs}ms`,
    transitionTimingFunction: easeOut,
    pointerEvents: phase === "ready" ? "auto" : "none",
    willChange: phase === "exiting" ? "opacity" : undefined,
  };

  const appShell = mountApp ? (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      style={transitionStyle}
      aria-hidden={phase !== "ready"}
    >
      {children}
    </div>
  ) : null;

  return (
    <>
      {appShell}
      {showSplash ? (
        <BootstrapLoadingScreen exiting={phase === "exiting"} />
      ) : null}
      <BootstrapStuckDetector
        phase={phase}
        error={error}
        startedAt={startedAt}
      />
      <NativeBootOverlay phase={phase} error={error} startedAt={startedAt} />
    </>
  );
}
