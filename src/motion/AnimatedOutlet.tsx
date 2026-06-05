import { useLocation, useOutlet } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AnimatedOutletProps = {
  /** Default: `fade` (CSS-only: slideUp/slideDown require motion lib). */
  preset?: "fade" | "none";
  className?: string;
  /** When `true`, transition key is `pathname + search` (re-animate on same path, different query). */
  includeSearchInKey?: boolean;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * CSS-only lightweight outlet wrapper with simple fade animation.
 * Replaces heavy framer-motion to reduce bundle size (~130KB).
 * For complex exit animations, use framer-motion directly in route components.
 */
export function AnimatedOutlet({
  preset = "fade",
  className,
  includeSearchInKey = false,
}: AnimatedOutletProps) {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = prefersReducedMotion();

  const routeKey = includeSearchInKey
    ? `${location.pathname}${location.search}`
    : location.pathname;

  if (reduceMotion || preset === "none") {
    return (
      <div className={cn("min-h-0 min-w-0 flex-1", className)}>{outlet}</div>
    );
  }

  // CSS-only fade animation
  return (
    <div
      key={routeKey}
      className={cn(
        "min-h-0 min-w-0 flex-1 animate-fade-in",
        className,
      )}
    >
      {outlet}
    </div>
  );
}
