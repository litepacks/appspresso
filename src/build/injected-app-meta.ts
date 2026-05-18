import type { AppspressoAppMeta } from "@/build/app-meta";
import { parseInjectedDefine } from "@/build/inject-env";

declare const __APSPRESSO_APP__: string | undefined;

/**
 * Host Vite `define` injects `__APSPRESSO_APP__` (double-json). Missing in some test roots → null.
 */
export function getInjectedAppMeta(): AppspressoAppMeta | null {
  try {
    const raw =
      typeof __APSPRESSO_APP__ !== "undefined" ? __APSPRESSO_APP__ : "null";
    return parseInjectedDefine<AppspressoAppMeta>(raw);
  } catch {
    return null;
  }
}
