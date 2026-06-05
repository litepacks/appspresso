import { Capacitor } from "@capacitor/core";

/** Logcat / Chrome filter: `adb logcat | grep APSPRESSO_BOOT` */
export const BOOT_TRACE_TAG = "APSPRESSO_BOOT";

export type BootTraceEntry = {
  /** Milliseconds since first bootTrace() in this session. */
  t: number;
  step: string;
  detail?: string;
};

let originMs =
  typeof performance !== "undefined" ? performance.now() : Date.now();
const entries: BootTraceEntry[] = [];
let lastStep = "—";

const MAX_ENTRIES = 48;

/** Verbose boot timeline — enabled in dev, `VITE_BOOT_TRACE`, or `VITE_NATIVE_DEBUG`. */
export function isBootTraceEnabled(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_BOOT_TRACE === "true" ||
    import.meta.env.VITE_NATIVE_DEBUG === "true"
  );
}

function formatDetail(detail?: Record<string, unknown> | string): string | undefined {
  if (detail == null) return undefined;
  if (typeof detail === "string") return detail;
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

/** Emit a single boot milestone (always `console.info` so logcat Console shows it). */
export function bootTrace(
  step: string,
  detail?: Record<string, unknown> | string,
): void {
  if (!isBootTraceEnabled()) return;

  const t = Math.round(performance.now() - originMs);
  const detailStr = formatDetail(detail);
  const entry: BootTraceEntry = { t, step, detail: detailStr };
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();
  lastStep = step;

  const line = detailStr
    ? `${BOOT_TRACE_TAG} +${t}ms ${step} | ${detailStr}`
    : `${BOOT_TRACE_TAG} +${t}ms ${step}`;
  console.info(line);
}

export function getBootTraceSnapshot(): {
  lastStep: string;
  entries: readonly BootTraceEntry[];
  elapsedMs: number;
  platform: string;
} {
  return {
    lastStep,
    entries: [...entries],
    elapsedMs: Math.round(performance.now() - originMs),
    platform: Capacitor.getPlatform(),
  };
}

/** Reset timeline (bootstrap retry). */
export function resetBootTraceOrigin(): void {
  originMs = performance.now();
  entries.length = 0;
  lastStep = "—";
  bootTrace("boot.trace.reset");
}
