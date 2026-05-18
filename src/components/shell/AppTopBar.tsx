import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppTopBarProps = {
  title: ReactNode;
  /**
   * Fills the center column (e.g. [`SearchInput`](../../ui/search-input)).
   * When set, shown instead of title; `title` still read via `sr-only` for accessibility.
   */
  center?: ReactNode;
  /** Left back button. */
  showBack?: boolean;
  onBack?: () => void;
  backAriaLabel?: string;
  /** Custom content instead of back (e.g. icon + text). */
  renderBack?: ReactNode;
  /** Right action (e.g. `Button`, menu). */
  right?: ReactNode;
  className?: string;
};

/**
 * Full-width top bar: back | title | right slot. Notch padding via `safe-top`.
 * When `showBack` and `onBack` is omitted, uses `navigate(-1)` (must be inside Router).
 */
export function AppTopBar({
  title,
  center,
  showBack = false,
  onBack,
  backAriaLabel = "Back",
  renderBack,
  right,
  className,
}: AppTopBarProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));
  const hasLeftRail = Boolean(showBack || renderBack);
  const hasRightRail = Boolean(right);
  /** When only center content (e.g. root search), use full width; otherwise side columns reserve min 2.75rem. */
  const fullWidthCenter = Boolean(center && !hasLeftRail && !hasRightRail);
  return (
    <header
      className={cn(
        "safe-top sticky top-0 z-30 w-full shrink-0",
        "border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/70",
        "shadow-[0_1px_0_0_hsl(var(--foreground)/0.04)]",
        className,
      )}
    >
      <div
        className={cn(
          "grid w-full items-center gap-2 px-3 pb-2.5 pt-1 sm:px-4",
          fullWidthCenter
            ? "grid-cols-1"
            : "grid-cols-[minmax(2.75rem,auto)_1fr_minmax(2.75rem,auto)]",
        )}
      >
        {fullWidthCenter ? (
          <div className="min-w-0 w-full">
            <span className="sr-only">{title}</span>
            {center}
          </div>
        ) : (
          <>
            <div className="flex min-h-10 min-w-0 items-center justify-start">
              {showBack
                ? (renderBack ?? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={handleBack}
                      aria-label={backAriaLabel}
                    >
                      <ArrowLeftIcon className="h-5 w-5" aria-hidden />
                    </Button>
                  ))
                : null}
            </div>
            <div className={cn("min-w-0", center ? "w-full" : "text-center")}>
              {center ? (
                <>
                  <span className="sr-only">{title}</span>
                  {center}
                </>
              ) : (
                <div className="text-pretty text-base font-semibold leading-snug tracking-tight sm:text-lg">
                  {title}
                </div>
              )}
            </div>
            <div className="flex min-h-10 min-w-0 items-center justify-end">
              {right ?? null}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
