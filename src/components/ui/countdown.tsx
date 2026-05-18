import * as React from "react";
import { cn } from "@/lib/utils";

export type CountdownParts = {
  /** Remaining time (ms), floored integer; 0 when complete */
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** Splits remaining ms into days/hours/minutes/seconds (`isComplete: true` when done). */
export function msToCountdownParts(remainingMs: number): CountdownParts {
  const clamped = Math.max(0, Math.floor(remainingMs));
  const isComplete = clamped <= 0;
  const sec = Math.floor(clamped / 1000);
  const days = Math.floor(sec / 86_400);
  const hours = Math.floor((sec % 86_400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { totalMs: clamped, days, hours, minutes, seconds, isComplete };
}

/** Default text: `3d 01:02:03`, `01:02:03`, `02:03` */
export function formatCountdown(parts: CountdownParts): string {
  if (parts.isComplete) return "0:00";
  const { days, hours, minutes, seconds } = parts;
  const hms = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  if (days > 0) return `${days}d ${hms}`;
  if (hours > 0) return hms;
  return `${minutes}:${pad2(seconds)}`;
}

function ariaCountdownLabel(parts: CountdownParts): string {
  if (parts.isComplete) return "Time expired";
  const bits: string[] = [];
  if (parts.days) bits.push(`${parts.days} days`);
  if (parts.hours) bits.push(`${parts.hours} hours`);
  if (parts.minutes) bits.push(`${parts.minutes} minutes`);
  if (parts.seconds || bits.length === 0) bits.push(`${parts.seconds} seconds`);
  return `Time remaining: ${bits.join(", ")}`;
}

export type UseCountdownOptions = {
  endAt: Date | number;
  /** Default 1000 ms */
  intervalMs?: number;
  /** For tests or synced clock; default `Date.now`. Current `now` read from ref each tick. */
  now?: () => number;
  onComplete?: () => void;
};

/**
 * Periodically updates remaining time until `endAt`.
 * `onComplete` runs at most once when complete.
 */
export function useCountdown({
  endAt,
  intervalMs = 1000,
  now,
  onComplete,
}: UseCountdownOptions): CountdownParts {
  const endMs = typeof endAt === "number" ? endAt : endAt.getTime();
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  const nowFn = now ?? Date.now;
  const nowRef = React.useRef(nowFn);
  nowRef.current = nowFn;

  const [parts, setParts] = React.useState(() =>
    msToCountdownParts(endMs - nowFn()),
  );

  React.useEffect(() => {
    let completeFired = false;
    const tick = () => {
      const next = msToCountdownParts(endMs - nowRef.current());
      setParts(next);
      if (next.isComplete && !completeFired) {
        completeFired = true;
        onCompleteRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [endMs, intervalMs]);

  return parts;
}

export type CountdownProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  UseCountdownOptions & {
    /** Text via `formatCountdown` when omitted */
    children?: (parts: CountdownParts) => React.ReactNode;
  };

/**
 * Countdown to absolute end time (`endAt`). Default output uses `tabular-nums` for aligned digits.
 * Customize with `children={(p) => ...}`.
 */
const Countdown = React.forwardRef<HTMLSpanElement, CountdownProps>(
  (
    {
      className,
      endAt,
      intervalMs,
      now,
      onComplete,
      children,
      ...props
    }: CountdownProps,
    ref,
  ) => {
    const parts = useCountdown({ endAt, intervalMs, now, onComplete });
    const content = children ? children(parts) : formatCountdown(parts);

    return (
      <span
        ref={ref}
        role="timer"
        className={cn("tabular-nums", className)}
        aria-live="polite"
        aria-label={ariaCountdownLabel(parts)}
        {...props}
      >
        {content}
      </span>
    );
  },
);
Countdown.displayName = "Countdown";

export { Countdown };
export default Countdown;
