import { XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppModalVariant = "sheet" | "centered";

export type AppModalProps = {
  /** Controlled visibility */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Top toolbar title */
  title?: React.ReactNode;
  /** Close with X top-right (default: true) */
  showCloseButton?: boolean;
  /** Close on backdrop tap (default: true) */
  closeOnBackdrop?: boolean;
  /** Close on Escape (default: true) */
  closeOnEscape?: boolean;
  /** Thin handle bar on top of sheet modals (default: true) */
  showHandle?: boolean;
  /** Lock body scroll while open (default: true) */
  lockScroll?: boolean;
  /** Extra content right of title row (e.g. secondary button) */
  headerEnd?: React.ReactNode;
  /**
   * `sheet`: bottom sheet panel (default).
   * `centered`: centered box; suitable for image lightbox, etc.
   */
  variant?: AppModalVariant;
  /** Backdrop layer — blur + dark tint by default for `centered` */
  backdropClassName?: string;
  /** Top title bar */
  headerClassName?: string;
  /** Extra classes for close button (ghost) */
  closeButtonClassName?: string;
  /** Scrollable body classes */
  className?: string;
  /** Panel shell (height, radius, etc.) */
  sheetClassName?: string;
  /**
   * Portal root (`fixed inset-0` flex wrapper) — e.g. full screen in lightbox with `p-0`.
   */
  frameClassName?: string;
  /** `role="dialog"` `aria-label` when `showToolbar` is false (default: "Modal") */
  contentAriaLabel?: string;
};

/**
 * Bottom sheet (`variant="sheet"`) or centered panel (`variant="centered"`).
 * Fully prop-driven (`open` / `onOpenChange`); no trigger component.
 */
export function AppModal({
  open,
  onOpenChange,
  children,
  title,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showHandle = true,
  lockScroll = true,
  headerEnd,
  variant = "sheet",
  backdropClassName,
  headerClassName,
  closeButtonClassName,
  className,
  sheetClassName,
  frameClassName,
  contentAriaLabel,
}: AppModalProps) {
  const titleId = React.useId();
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  const showToolbar = title != null || showCloseButton || headerEnd != null;

  React.useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, close]);

  React.useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const backdropClass = cn(
    "animate-in fade-in-0 absolute inset-0 duration-200",
    variant === "centered"
      ? "bg-black/55 backdrop-blur-xl backdrop-saturate-150"
      : "bg-black/45",
    backdropClassName,
  );

  const sheetClass = cn(
    "relative z-[1] flex w-full min-w-0 flex-col",
    variant === "centered"
      ? cn(
          "max-h-[min(94dvh,calc(100dvh-1rem))] max-w-[min(100vw-1rem,96rem)]",
          "rounded-2xl border border-border/80 bg-background",
          "shadow-[0_25px_50px_-12px_rgb(0_0_0/0.45)] animate-in fade-in-0 zoom-in-95 duration-300",
          "safe-bottom",
        )
      : cn(
          "max-h-[min(92dvh,calc(100dvh-0.5rem))]",
          "rounded-t-[20px] border border-b-0 border-border bg-background",
          "shadow-[0_-8px_40px_-4px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-300",
          "safe-bottom",
        ),
    sheetClassName,
  );

  const tree = (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex max-h-dvh flex-col",
        variant === "centered"
          ? "items-center justify-center p-3 sm:p-4"
          : "justify-end",
        frameClassName,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={showToolbar ? titleId : undefined}
      aria-label={!showToolbar ? (contentAriaLabel ?? "Modal") : undefined}
    >
      {closeOnBackdrop ? (
        <button
          type="button"
          className={cn(backdropClass, "cursor-default border-0")}
          aria-label="Dismiss"
          onClick={close}
        />
      ) : (
        <div className={cn(backdropClass, "pointer-events-auto")} aria-hidden />
      )}

      <div className={sheetClass}>
        {showHandle ? (
          <div className="flex shrink-0 justify-center pt-2 pb-1" aria-hidden>
            <div className="h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
          </div>
        ) : null}

        {showToolbar ? (
          <header
            className={cn(
              "relative flex h-11 shrink-0 items-center justify-center border-border/80 border-b px-2",
              headerClassName,
            )}
          >
            {title != null ? (
              <h2
                id={titleId}
                className="max-w-[calc(100%-5rem)] truncate px-2 text-center text-base font-semibold leading-tight tracking-tight"
              >
                {title}
              </h2>
            ) : (
              <span id={titleId} className="sr-only">
                Modal
              </span>
            )}
            <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5">
              {headerEnd}
              {showCloseButton ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 shrink-0", closeButtonClassName)}
                  onClick={close}
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden />
                </Button>
              ) : null}
            </div>
          </header>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-4",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(tree, document.body);
}
