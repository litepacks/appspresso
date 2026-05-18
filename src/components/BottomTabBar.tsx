import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_BADGE_MAX = 99;

function formatTabBadgeCount(n: number, max: number): string {
  if (n <= max) return String(n);
  return `${max}+`;
}

export type BottomTabBarItem = {
  /** React `key`; usually same as `to`. */
  id: string;
  to: string;
  end?: boolean;
  label: string;
  renderIcon: (active: boolean) => ReactNode;
  /** Badge on icon corner when greater than zero; above `badgeMax` shows `99+`, etc. */
  badgeCount?: number;
  /** Upper cap on badge text; default 99. */
  badgeMax?: number;
};

export function isBottomTabActive(
  pathname: string,
  to: string,
  end?: boolean,
): boolean {
  if (end === true) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export type BottomTabBarProps = {
  items: readonly BottomTabBarItem[];
  pathname: string;
  navigate: (to: string) => void;
  /** Extra classes for inner scroll row */
  className?: string;
};

/**
 * Bottom tab row: full width; tabs share space equally via `flex-1` (horizontal scroll when many tabs).
 * Wrap with [`AppBottomTabShell`](./shell/AppBottomTabShell.tsx) or equivalent `nav` above.
 */
export function BottomTabBar({
  items,
  pathname,
  navigate,
  className,
}: BottomTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep active tab in view (many tabs / overflow).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll when pathname changes
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[data-tab-active="true"]');
    active?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [pathname]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "appspresso-tab-scroll flex w-full min-w-0 max-w-full flex-nowrap items-stretch gap-0 overflow-x-auto overflow-y-hidden touch-manipulation",
        "overscroll-x-contain touch-pan-x px-0 py-1 sm:gap-0.5",
        className,
      )}
    >
      {items.map(
        ({
          id,
          to,
          end,
          label,
          renderIcon: renderIconProp,
          badgeCount,
          badgeMax = DEFAULT_BADGE_MAX,
        }) => {
          const active = isBottomTabActive(pathname, to, end);
          const showBadge =
            typeof badgeCount === "number" &&
            Number.isFinite(badgeCount) &&
            badgeCount > 0;
          const badgeText = showBadge
            ? formatTabBadgeCount(Math.floor(badgeCount), badgeMax)
            : null;

          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                navigate(to);
              }}
              aria-current={active ? "page" : undefined}
              aria-label={badgeText ? `${label} (${badgeText})` : undefined}
              className={cn(
                "flex min-h-[3.25rem] min-w-0 max-w-none flex-1 basis-0 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1 text-[11px] font-semibold leading-none tracking-tight transition-colors active:opacity-90 sm:px-1 sm:text-xs",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                data-tab-active={active ? "true" : undefined}
                className={cn(
                  "relative mx-auto flex h-9 w-full max-w-[3rem] items-center justify-center rounded-full transition-colors sm:h-10 sm:max-w-[3.5rem]",
                  active && "bg-foreground/10",
                )}
              >
                {renderIconProp(active)}
                {badgeText ? (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 min-w-[1.125rem] scale-90 px-1 py-0 shadow-sm"
                  >
                    {badgeText}
                  </Badge>
                ) : null}
              </span>
              <span className="line-clamp-2 w-full min-w-0 px-0.5 text-center">
                {label}
              </span>
            </button>
          );
        },
      )}
    </div>
  );
}
