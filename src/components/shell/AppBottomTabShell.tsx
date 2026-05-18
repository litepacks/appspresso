import type { ReactNode } from "react";
import { useKeyboardState } from "@/hooks/useKeyboardState";
import { cn } from "@/lib/utils";

export type AppBottomTabShellProps = {
  /** Accessible tab list label */
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  /**
   * When `true`, slides the bottom bar away while the keyboard appears (`pointer-events` off).
   * Listeners are registered only when this prop is enabled.
   */
  hideWhenKeyboardOpen?: boolean;
};

/**
 * Full-width bottom tab shell: `nav` + safe-area + top border. Content is usually [`BottomTabBar`](../BottomTabBar.tsx).
 */
export function AppBottomTabShell({
  ariaLabel,
  children,
  className,
  hideWhenKeyboardOpen = false,
}: AppBottomTabShellProps) {
  const keyboard = useKeyboardState({ enabled: hideWhenKeyboardOpen });
  const hidden = hideWhenKeyboardOpen && keyboard.isOpen;

  return (
    <nav
      className={cn(
        "safe-bottom z-40 w-full min-w-0 max-w-none shrink-0 border-border/50 border-t",
        "bg-background/95 shadow-[0_-8px_30px_-12px_rgb(0_0_0/0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90",
        "transition-[transform,opacity] duration-200 ease-out will-change-transform",
        hidden &&
          "pointer-events-none translate-y-full opacity-0 motion-reduce:transition-none",
        className,
      )}
      aria-label={ariaLabel}
      aria-hidden={hidden ? true : undefined}
    >
      {children}
    </nav>
  );
}
