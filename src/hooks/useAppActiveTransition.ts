import { useEffect, useRef } from "react";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";

export type UseAppActiveTransitionOptions = {
  /**
   * Previous frame `isActive === true`, now `false`: app in background.
   * Android Home / recents use same lifecycle (no separate home event).
   */
  onBackground?: () => void;
  /** Return to foreground from background */
  onForeground?: () => void;
  enabled?: boolean;
};

/**
 * **Active ↔ background** edge transitions via `appLifecycleAtom`.
 * Requires `AppLifecycleSync` + `initAppLifecycle` (Capacitor `appStateChange` / web `visibilitychange`).
 */
export function useAppActiveTransition({
  onBackground,
  onForeground,
  enabled = true,
}: UseAppActiveTransitionOptions): void {
  const bgRef = useRef(onBackground);
  const fgRef = useRef(onForeground);
  bgRef.current = onBackground;
  fgRef.current = onForeground;

  const { isActive } = useAppLifecycle();
  const prevActiveRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const prev = prevActiveRef.current;
    const cur = isActive;
    if (enabled && prev !== undefined) {
      if (prev && !cur) bgRef.current?.();
      if (!prev && cur) fgRef.current?.();
    }
    prevActiveRef.current = cur;
  }, [enabled, isActive]);
}
