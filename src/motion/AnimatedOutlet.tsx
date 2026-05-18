import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useOutlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  type PageTransitionPreset,
  pageTransitionPresets,
} from "@/motion/presets";

export type AnimatedOutletProps = {
  /** Default: `slideUp` */
  preset?: PageTransitionPreset;
  className?: string;
  /** When `true`, transition key is `pathname + search` (re-animate on same path, different query). */
  includeSearchInKey?: boolean;
};

/**
 * Use instead of `<Outlet />` in the Router for exit animations via `useOutlet` + `AnimatePresence`.
 * Prefer inside the scrolling body, outside the top shell (header / tab bar).
 */
export function AnimatedOutlet({
  preset = "slideUp",
  className,
  includeSearchInKey = false,
}: AnimatedOutletProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();

  const cfg = pageTransitionPresets[preset];
  const routeKey = includeSearchInKey
    ? `${location.pathname}${location.search}`
    : location.pathname;

  if (reduceMotion) {
    return (
      <div className={cn("min-h-0 min-w-0 flex-1", className)}>{outlet}</div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        className={cn("min-h-0 min-w-0 flex-1", className)}
        initial={cfg.initial}
        animate={cfg.animate}
        exit={cfg.exit}
        transition={cfg.transition}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
