import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { runBootstrap, runDeferredNativeBootstrap } from "@/app/bootstrap";
import { delay, getSplashBootstrapTiming } from "@/lib/splash-bootstrap";

export type AppspressoBootstrapPhase = "loading" | "exiting" | "ready";

/**
 * Runs `runBootstrap()` once on mount.
 * Bootstrap bittikten sonra en az `app.splash.webBootstrapMinDurationMs` bekler,
 * then exit animation (`webExitDurationMs`) and `ready` phase.
 */
export function useAppspressoBootstrapPhase(): AppspressoBootstrapPhase {
  const [phase, setPhase] = useState<AppspressoBootstrapPhase>("loading");

  useEffect(() => {
    const started = performance.now();
    let cancelled = false;

    void runBootstrap()
      .catch(() => {})
      .finally(async () => {
        if (cancelled) return;
        const { minDisplayMs, exitDurationMs } = getSplashBootstrapTiming();
        const elapsed = performance.now() - started;
        const wait = Math.max(0, minDisplayMs - elapsed);
        if (wait > 0) await delay(wait);
        if (cancelled) return;
        if (Capacitor.isNativePlatform()) {
          runDeferredNativeBootstrap();
        }
        setPhase("exiting");
        await delay(exitDurationMs);
        if (!cancelled) setPhase("ready");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return phase;
}

/** Shorthand for `phase === "ready"` — existing consumers. */
export function useAppspressoBootstrap(): boolean {
  return useAppspressoBootstrapPhase() === "ready";
}
