import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PullToRefreshProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onScroll"
> & {
  children: React.ReactNode;
  /** Awaited until complete; errors swallowed (host may catch via `reportError` / boundary). */
  onRefresh: () => void | Promise<void>;
  disabled?: boolean;
  /** Minimum pull distance (px) to trigger refresh on release. */
  threshold?: number;
  /** Maximum visual pull distance (px). */
  maxPull?: number;
  /** Accessible label for indicator (e.g. i18n). */
  statusLabel?: string;
};

function springToZero(reduceMotion: boolean | null) {
  return reduceMotion
    ? { type: "tween" as const, duration: 0.2, ease: "easeOut" as const }
    : {
        type: "spring" as const,
        stiffness: 380,
        damping: 32,
        mass: 0.9,
      };
}

function springToThreshold(reduceMotion: boolean | null) {
  return reduceMotion
    ? { type: "tween" as const, duration: 0.14, ease: "easeOut" as const }
    : {
        type: "spring" as const,
        stiffness: 520,
        damping: 28,
        mass: 0.85,
      };
}

/**
 * Pull-to-refresh for vertically scrollable body (`overflow-y-auto`).
 * Content offset and snap-back after release animated with **Motion** springs / tween.
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false,
  threshold = 56,
  maxPull = 120,
  statusLabel = "Refreshing",
  ...rest
}: PullToRefreshProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const inFlight = useRef(false);
  const yAnim = useRef<ReturnType<typeof animate> | null>(null);

  const y = useMotionValue(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [touching, setTouching] = useState(false);

  const reduceMotion = useReducedMotion();
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const indicatorOpacity = useTransform(y, [0, threshold], [0.35, 1]);
  const indicatorScale = useTransform(y, [0, threshold], [0.88, 1]);

  useMotionValueEvent(y, "change", (latest) => {
    setPull(latest);
  });

  const damp = useCallback(
    (dy: number) => Math.min(maxPull, dy * (reduceMotion ? 0.88 : 0.52)),
    [maxPull, reduceMotion],
  );

  const stopYAnim = useCallback(() => {
    yAnim.current?.stop();
    yAnim.current = null;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (inFlight.current) return;
      stopYAnim();
      if (el.scrollTop <= 0) {
        tracking.current = true;
        startY.current = e.touches[0].clientY;
        setTouching(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current || inFlight.current) return;
      if (el.scrollTop > 0) {
        tracking.current = false;
        pullRef.current = 0;
        y.set(0);
        setTouching(false);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        const p = damp(dy);
        pullRef.current = p;
        y.set(p);
      } else {
        pullRef.current = 0;
        y.set(0);
      }
    };

    const finishTracking = () => {
      setTouching(false);
      if (!tracking.current) return;
      tracking.current = false;
      const p = pullRef.current;
      pullRef.current = 0;

      if (p >= threshold && !inFlight.current) {
        inFlight.current = true;
        setRefreshing(true);
        y.set(p);
        void (async () => {
          const up = animate(y, threshold, springToThreshold(reduceMotion));
          yAnim.current = up;
          try {
            await up;
            await Promise.resolve(onRefreshRef.current());
          } catch {
            /* host / boundary */
          } finally {
            setRefreshing(false);
            stopYAnim();
            const down = animate(y, 0, springToZero(reduceMotion));
            yAnim.current = down;
            try {
              await down;
            } finally {
              inFlight.current = false;
              yAnim.current = null;
            }
          }
        })();
      } else {
        stopYAnim();
        yAnim.current = animate(y, 0, springToZero(reduceMotion));
      }
    };

    const onTouchEnd = () => {
      finishTracking();
    };

    const onTouchCancel = () => {
      setTouching(false);
      tracking.current = false;
      pullRef.current = 0;
      if (!inFlight.current) {
        stopYAnim();
        yAnim.current = animate(y, 0, springToZero(reduceMotion));
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchCancel);

    return () => {
      stopYAnim();
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [disabled, damp, reduceMotion, stopYAnim, threshold, y]);

  const showIndicator = pull > 8 || refreshing;

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        className={cn(
          "h-full min-h-0 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
          className,
        )}
        aria-busy={refreshing || undefined}
        data-pull-refresh={refreshing ? "refreshing" : undefined}
        {...rest}
      >
        {showIndicator ? (
          <div
            className="pointer-events-none sticky top-0 z-10 relative h-0 w-full shrink-0"
            aria-hidden
          >
            <motion.div
              className="absolute top-2 left-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 shadow-sm ring-1 ring-border"
              style={{
                x: "-50%",
                opacity: indicatorOpacity,
                scale: indicatorScale,
              }}
            >
              <motion.span
                className="flex items-center justify-center"
                animate={
                  refreshing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
                }
                transition={
                  refreshing && !reduceMotion
                    ? { repeat: Infinity, duration: 0.85, ease: "linear" }
                    : { duration: 0.15 }
                }
              >
                <ArrowPathIcon
                  className={cn(
                    "h-5 w-5 text-primary",
                    refreshing && reduceMotion && "motion-safe:animate-spin",
                  )}
                  aria-hidden
                />
              </motion.span>
            </motion.div>
          </div>
        ) : null}
        {refreshing ? (
          <span className="sr-only" role="status">
            {statusLabel}
          </span>
        ) : null}
        <motion.div
          className={touching ? "will-change-transform" : undefined}
          style={{ y }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
