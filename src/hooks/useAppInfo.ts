import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { type AppInfoSnapshot, getAppInfoSnapshot } from "@/lib/app-info";
import { appInfoAtom } from "@/state/atoms";

/**
 * App identity: `appInfoAtom` version + Vite `__APSPRESSO_APP__` meta (`displayName`, `appId`, …).
 */
export function useAppInfo(): AppInfoSnapshot {
  const { version } = useAtomValue(appInfoAtom);
  return useMemo(() => getAppInfoSnapshot(version), [version]);
}

export { type AppInfoSnapshot, getAppInfoSnapshot } from "@/lib/app-info";
