import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { BootstrapLoadingScreen } from "@/app/BootstrapLoadingScreen";
import { useAppspressoBootstrapPhase } from "@/hooks/useAppspressoBootstrap";
import { getSplashBootstrapTiming } from "@/lib/splash-bootstrap";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type AppspressoBootstrapGateProps = {
  children: ReactNode;
};

/**
 * Bootstrap splash → main app: cross-fade on exit (splash on top, content fades in below).
 * Usable inside or outside `AppspressoRootProviders`; keeps demo providers above.
 */
export function AppspressoBootstrapGate({ children }: AppspressoBootstrapGateProps) {
  const phase = useAppspressoBootstrapPhase();
  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const reduceMotion = useReducedMotion();
  const exitSec = timing.exitDurationMs / 1000;

  const showSplash = phase !== "ready";
  const mountApp = phase === "exiting" || phase === "ready";

  if (phase === "loading") {
    return <BootstrapLoadingScreen />;
  }

  return (
    <>
      {mountApp ? (
        <motion.div
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: exitSec, ease: easeOut }
          }
          style={{
            pointerEvents: phase === "ready" ? "auto" : "none",
          }}
          aria-hidden={phase !== "ready"}
        >
          {children}
        </motion.div>
      ) : null}
      {showSplash ? (
        <BootstrapLoadingScreen exiting={phase === "exiting"} />
      ) : null}
    </>
  );
}
