import {
  type UseAppActiveTransitionOptions,
  useAppActiveTransition,
} from "@/hooks/useAppActiveTransition";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";

export type UseAppBackgroundOptions = UseAppActiveTransitionOptions;

/**
 * Side effects on **background ↔ foreground** transitions.
 * Same as `useAppActiveTransition`; naming-focused alias.
 *
 * Requires `AppLifecycleSync` in tree (Capacitor `appStateChange` / web `visibilitychange`).
 */
export function useAppBackground(options: UseAppBackgroundOptions): void {
  useAppActiveTransition(options);
}

/** When `true`, app is in background (`!isActive`). Snapshot; use `useAppBackground` for edges. */
export function useIsAppInBackground(): boolean {
  const { isActive } = useAppLifecycle();
  return !isActive;
}
