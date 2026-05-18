import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Fill ratio (0–1) for 1-based index `i`. */
function fillForStar(i: number, value: number): number {
  return clamp01(value - (i - 1));
}

const SIZE_CLASS = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export type StarRatingSize = keyof typeof SIZE_CLASS;

export type StarRatingProps = {
  /** Selected score (0–max); partial stars for decimal read-only display. */
  value: number;
  /** Scale length (default 5) */
  max?: number;
  /** When set, each star is a button; click returns `1..max`. */
  onChange?: (value: number) => void;
  /** Disables clicking when `onChange` is set */
  disabled?: boolean;
  size?: StarRatingSize;
  className?: string;
  /** Accessible name for the box */
  label?: string;
  /** Filled star color */
  starClassName?: string;
  /** Empty / outline color */
  emptyClassName?: string;
};

function StarSlot({
  fill,
  size,
  starClassName,
  emptyClassName,
}: {
  fill: number;
  size: StarRatingSize;
  starClassName?: string;
  emptyClassName?: string;
}) {
  const dim = SIZE_CLASS[size];
  return (
    <span className={cn("relative inline-block shrink-0", dim)}>
      <StarOutline
        className={cn(
          "absolute inset-0 text-muted-foreground",
          dim,
          emptyClassName,
        )}
        aria-hidden
      />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
        aria-hidden
      >
        <StarSolid
          className={cn(
            dim,
            "text-amber-500 dark:text-amber-400",
            starClassName,
          )}
          aria-hidden
        />
      </span>
    </span>
  );
}

/**
 * Star rating — read-only (no `onChange`) or clickable.
 * Read-only shows partial fill for decimal `value`; interaction always selects whole numbers.
 */
export function StarRating({
  value,
  max = 5,
  onChange,
  disabled = false,
  size = "md",
  className,
  label = "Rating",
  starClassName,
  emptyClassName,
}: StarRatingProps) {
  const rounded = Math.round(max);
  const count = Math.max(1, rounded);
  const display = Math.min(Math.max(0, value), count);

  const commonStars = (
    <>
      {Array.from({ length: count }, (_, idx) => {
        const i = idx + 1;
        const fill = fillForStar(i, display);
        return (
          <StarSlot
            key={i}
            fill={fill}
            size={size}
            starClassName={starClassName}
            emptyClassName={emptyClassName}
          />
        );
      })}
    </>
  );

  if (onChange != null && !disabled) {
    return (
      <fieldset
        className={cn(
          "inline-flex min-w-0 items-center gap-0.5 border-0 p-0",
          className,
        )}
      >
        <legend className="sr-only">{label}</legend>
        {Array.from({ length: count }, (_, idx) => {
          const i = idx + 1;
          const fill = fillForStar(i, display);
          const active = i <= Math.round(display);
          return (
            <button
              key={i}
              type="button"
              className={cn(
                "touch-manipulation rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "enabled:active:scale-95 enabled:transition-transform motion-reduce:transition-none",
              )}
              aria-pressed={active}
              aria-label={`${i} of ${count} stars`}
              onClick={() => onChange(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  onChange(Math.min(count, i + 1));
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  onChange(Math.max(1, i - 1));
                }
                if (e.key === "Home") {
                  e.preventDefault();
                  onChange(1);
                }
                if (e.key === "End") {
                  e.preventDefault();
                  onChange(count);
                }
              }}
            >
              <StarSlot
                fill={fill}
                size={size}
                starClassName={starClassName}
                emptyClassName={emptyClassName}
              />
            </button>
          );
        })}
      </fieldset>
    );
  }

  const roundedLabel = Math.round(display * 10) / 10;

  return (
    <div
      role="img"
      aria-label={`${label}: ${roundedLabel} of ${count} stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {commonStars}
    </div>
  );
}

export default StarRating;
