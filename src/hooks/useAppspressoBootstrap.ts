import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import { runBootstrap, runDeferredNativeBootstrap } from "@/app/bootstrap";
import { BOOTSTRAP_DEADLINE_MS } from "@/lib/bootstrap-timing";
import { bootTrace, resetBootTraceOrigin } from "@/lib/boot-trace";
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
  /** Monotonic start time for stuck-bootstrap UI (performance.now). */
  startedAt: number;
};

/**
 * Runs `runBootstrap()` on mount (and on `retry`).
 * Bootstrap failure surfaces as `phase === "failed"` instead of silently reaching `ready`.
 */
export function useAppspressoBootstrapState(): AppspressoBootstrapState {
  const [phase, setPhase] = useState<AppspressoBootstrapPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [startedAt, setStartedAt] = useState(() => performance.now());

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` intentionally retriggers bootstrap on retry
  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    resetBootTraceOrigin();
    setStartedAt(started);
    bootTrace("bootstrap.hook.start", { attempt });

    void (async () => {
      setError(null);
      setPhase("loading");
      appStore.set(bootstrapStatusAtom, { phase: "running" });

      const deadline = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(
            new Error(
              `Bootstrap timed out after ${BOOTSTRAP_DEADLINE_MS}ms — check network, plugins, or native bridge`,
            ),
          );
        }, BOOTSTRAP_DEADLINE_MS);
      });

      try {
        await Promise.race([runBootstrap(), deadline]);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        bootTrace("bootstrap.hook.failed", { message });
        setError(message);
        setPhase("failed");
        return;
      }

      if (cancelled) return;
      const { minDisplayMs, exitDurationMs } = getSplashBootstrapTiming();
      const elapsed = performance.now() - started;
      const wait = Math.max(0, minDisplayMs - elapsed);
      bootTrace("bootstrap.hook.splash-wait", { waitMs: Math.round(wait) });
      if (wait > 0) await delay(wait);
      if (cancelled) return;
      if (Capacitor.isNativePlatform()) {
        bootTrace("bootstrap.hook.deferred-native.schedule");
        runDeferredNativeBootstrap();
      }
      bootTrace("bootstrap.hook.phase.exiting");
      setPhase("exiting");
      await delay(exitDurationMs);
      if (!cancelled) {
        bootTrace("bootstrap.hook.phase.ready");
        setPhase("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { phase, error, retry, startedAt };
}

/** @deprecated Prefer `useAppspressoBootstrapState().phase` */
export function useAppspressoBootstrapPhase(): AppspressoBootstrapPhase {
  return useAppspressoBootstrapState().phase;
}

/** Shorthand for `phase === "ready"`. */
export function useAppspressoBootstrap(): boolean {
  return useAppspressoBootstrapState().phase === "ready";
}
