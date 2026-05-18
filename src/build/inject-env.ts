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

/**
 * Parse Vite `define` values produced with `JSON.stringify(JSON.stringify(data))`.
 * Returns `null` when the injected payload is JSON `null`.
 */
export function parseViteDoubleJson<T>(raw: string): T | null {
  try {
    let v: unknown = JSON.parse(raw);
    if (typeof v === "string") v = JSON.parse(v);
    if (v == null) return null;
    return v as T;
  } catch {
    return null;
  }
}
