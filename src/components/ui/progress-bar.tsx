import * as React from "react";
import { cn } from "@/lib/utils";

const sizeHeights = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

export type ProgressBarSize = keyof typeof sizeHeights;

export type ProgressBarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "role"
> & {
  /** Ignored in indeterminate mode */
  value?: number;
  /** Default 100 */
  max?: number;
  /** Indefinite progress animation */
  indeterminate?: boolean;
  size?: ProgressBarSize;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Determinate or indeterminate horizontal progress bar; `role="progressbar"`.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      indeterminate = false,
      size = "md",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const safeMax = max > 0 ? max : 100;
    const ratio = indeterminate ? 0 : clamp(value / safeMax, 0, 1);
    const percent = Math.round(ratio * 1000) / 10;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamp(value, 0, safeMax)}
        aria-valuetext={indeterminate ? undefined : `${percent}%`}
        aria-busy={indeterminate || undefined}
        aria-label={ariaLabel ?? (indeterminate ? "Loading" : "Progress")}
        className={cn(
          "w-full min-w-0 overflow-hidden rounded-full bg-muted",
          sizeHeights[size],
          className,
        )}
        {...props}
      >
        {indeterminate ? (
          <div
            className="h-full w-1/3 rounded-full bg-primary motion-reduce:animate-none animate-progress-indeterminate"
            aria-hidden
          />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;
