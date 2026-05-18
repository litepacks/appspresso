import * as React from "react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
} as const;

export type CircleProgressSize = keyof typeof sizeClasses;

const VB = 100;
/** Stroke center radius (viewBox units) */
const R = 40;
const CIRC = 2 * Math.PI * R;

export type CircleProgressProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "role"
> & {
  /** Ignored in indeterminate mode */
  value?: number;
  /** Default 100 */
  max?: number;
  /** Spinning partial arc */
  indeterminate?: boolean;
  size?: CircleProgressSize;
  /** Center percent or custom content */
  children?: React.ReactNode;
  /** Center percent text when no `children` (e.g. `42%`) */
  showValueLabel?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * SVG ring progress; `role="progressbar"`. Optional center label (`children` or `showValueLabel`).
 */
export const CircleProgress = React.forwardRef<
  HTMLDivElement,
  CircleProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      indeterminate = false,
      size = "md",
      children,
      showValueLabel = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const safeMax = max > 0 ? max : 100;
    const ratio = indeterminate ? 0 : clamp(value / safeMax, 0, 1);
    const percentRounded = Math.round(ratio * 1000) / 10;
    const percentText = `${percentRounded}%`;

    const trackCircle = (
      <circle
        cx={VB / 2}
        cy={VB / 2}
        r={R}
        fill="none"
        className="text-muted stroke-current"
        strokeWidth={8}
        aria-hidden
      />
    );

    const progressCircle = (
      <circle
        cx={VB / 2}
        cy={VB / 2}
        r={R}
        fill="none"
        className="text-primary stroke-current"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={indeterminate ? `${CIRC * 0.28} ${CIRC}` : CIRC}
        strokeDashoffset={indeterminate ? 0 : CIRC * (1 - ratio)}
        aria-hidden
      />
    );

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-busy={indeterminate || undefined}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamp(value, 0, safeMax)}
        aria-valuetext={indeterminate ? undefined : percentText}
        aria-label={ariaLabel ?? (indeterminate ? "Loading" : "Progress")}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <svg
          role="presentation"
          viewBox={`0 0 ${VB} ${VB}`}
          className="size-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <g transform={`rotate(-90 ${VB / 2} ${VB / 2})`}>
            {trackCircle}
            {indeterminate ? (
              <g
                className="motion-reduce:animate-none animate-spin"
                style={{ transformOrigin: `${VB / 2}px ${VB / 2}px` }}
              >
                {progressCircle}
              </g>
            ) : (
              progressCircle
            )}
          </g>
        </svg>
        {(children != null || (showValueLabel && !indeterminate)) && (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[0.55em] font-medium tabular-nums leading-none text-foreground"
            aria-hidden
          >
            {children ?? percentText}
          </span>
        )}
      </div>
    );
  },
);

CircleProgress.displayName = "CircleProgress";

export default CircleProgress;
