import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import { runBootstrap, runDeferredNativeBootstrap } from "@/app/bootstrap";
import { delay, getSplashBootstrapTiming } from "@/lib/splash-bootstrap";
import { bootstrapStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

export type AppspressoBootstrapPhase =
  | "loading"
  | "exiting"
  | "ready"
  | "failed";

export type AppspressoBootstrapState = {
  phase: AppspressoBootstrapPhase;
  error: string | null;
  retry: () => void;
};

/**
 * Runs `runBootstrap()` on mount (and on `retry`).
 * Bootstrap failure surfaces as `phase === "failed"` instead of silently reaching `ready`.
 */
export function useAppspressoBootstrapState(): AppspressoBootstrapState {
  const [phase, setPhase] = useState<AppspressoBootstrapPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` intentionally retriggers bootstrap on retry
  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    void (async () => {
      setError(null);
      setPhase("loading");
      appStore.set(bootstrapStatusAtom, { phase: "running" });

      try {
        await runBootstrap();
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setPhase("failed");
        return;
      }

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
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { phase, error, retry };
}

/** @deprecated Prefer `useAppspressoBootstrapState().phase` */
export function useAppspressoBootstrapPhase(): AppspressoBootstrapPhase {
  return useAppspressoBootstrapState().phase;
}

/** Shorthand for `phase === "ready"`. */
export function useAppspressoBootstrap(): boolean {
  return useAppspressoBootstrapState().phase === "ready";
}
