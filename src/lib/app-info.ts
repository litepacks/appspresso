import type { AppspressoAppMeta } from "@/build/app-meta";
import { getInjectedAppMeta } from "@/build/injected-app-meta";

export type AppInfoSnapshot = {
  /** Running package version / atom priority (order below) */
  version: string;
  /** Vite-injected `AppspressoAppMeta`; `null` when absent */
  meta: AppspressoAppMeta | null;
  displayName: string;
  appId: string;
  description: string | null;
  icon: string | null;
};

function defaultBuildVersion(): string {
  return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";
}

/**
 * One-shot app summary: `__APSPRESSO_APP__` meta + version.
 * Version order: `versionFromAtom` (if set) → `meta.version` → `__APP_VERSION__`.
 *
 * Do not pass `versionFromAtom` outside React or SSR; hook `useAppInfo` binds the atom.
 */
export function getAppInfoSnapshot(
  versionFromAtom?: string | null,
): AppInfoSnapshot {
  const meta = getInjectedAppMeta();
  const version =
    versionFromAtom?.trim() || meta?.version?.trim() || defaultBuildVersion();

  return {
    version,
    meta,
    displayName: meta?.displayName?.trim() || "App",
    appId: meta?.id?.trim() ?? "",
    description: meta?.description?.trim() ?? null,
    icon: meta?.icon?.trim() ?? null,
  };
}

export type { AppspressoAppMeta };
