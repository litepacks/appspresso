import { useAtomValue } from "jotai";
import { appLifecycleAtom } from "@/state/atoms";

/**
 * Returns `appLifecycleAtom`. Use `AppLifecycleSync` in the tree for updates.

 *
 * On Android Home is not a separate API event; app goes to background
 * and `isActive` becomes false (edge via `useAppActiveTransition`).
 */
export function useAppLifecycle() {
  return useAtomValue(appLifecycleAtom);
}
