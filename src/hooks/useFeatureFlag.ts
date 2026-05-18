import { useAtomValue } from "jotai";
import { resolveFeatureFlag } from "@/config/feature-flags";
import { featureFlagsAtom } from "@/state/atoms";

/**
 * Reads current flags after bootstrap (`featureFlagsAtom`).
 * Returns `defaultValue` when key is missing.
 */
export function useFeatureFlag(flagKey: string, defaultValue = false): boolean {
  const flags = useAtomValue(featureFlagsAtom);
  return resolveFeatureFlag(flags, flagKey, defaultValue);
}
