/**
 * Runtime-safe helpers for Vite `define` payloads (`__APSPRESSO_HOST__`, `__APSPRESSO_APP__`).
 * Keep this file free of Vite plugin / Tailwind / PostCSS imports so host apps do not ship Node-only code in the client bundle.
 */
export type AppspressoViteHostConfig = {
  mount: {
    rootElementId: string;
    strictMode: boolean;
  };
  /**
   * Optional host chrome (e.g. demo / embedded preview).
   * Consumed with `HostAppFrame` from the host `main.tsx`.
   */
  hostBanner?: {
    enabled?: boolean;
    title?: string;
    /** Plain text body */
    body?: string;
  };
};

declare const __APSPRESSO_HOST__: string | undefined;

/**
 * Parse a Vite `define` string (`JSON.stringify(JSON.stringify(data))`).
 * Returns `null` when the payload is JSON `null` or invalid.
 */
export function parseInjectedDefine<T>(raw: string): T | null {
  try {
    let v: unknown = JSON.parse(raw);
    if (typeof v === "string") v = JSON.parse(v);
    if (v == null) return null;
    return v as T;
  } catch {
    return null;
  }
}

/**
 * `createAppspressoViteConfig` → `__APSPRESSO_HOST__` (mount, host banner, …).
 * @throws when the host app was not built with Appspresso Vite defaults.
 */
export function getInjectedHostConfig(): AppspressoViteHostConfig {
  const raw =
    typeof __APSPRESSO_HOST__ !== "undefined" ? __APSPRESSO_HOST__ : undefined;
  if (raw === undefined) {
    throw new Error(
      "Appspresso: missing __APSPRESSO_HOST__. Use createAppspressoViteConfig() in your Vite config.",
    );
  }
  const host = parseInjectedDefine<AppspressoViteHostConfig>(raw);
  if (!host) {
    throw new Error("Appspresso: invalid __APSPRESSO_HOST__ payload.");
  }
  return host;
}

/** @deprecated Use {@link parseInjectedDefine}. */
export const parseViteDoubleJson = parseInjectedDefine;
