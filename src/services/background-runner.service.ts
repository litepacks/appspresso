import { Capacitor } from "@capacitor/core";
import { getInjectedAppMeta } from "@/build/injected-app-meta";
import { logger } from "@/lib/logger";

export type BackgroundRunnerDispatchOptions = {
  event: string;
  /** Runner `label` — else `appspresso.config` → `app.backgroundRunner.label` or `{appId}.background`. */
  label?: string;
  /** `dispatchEvent` payload (`details` field). */
  details?: Record<string, unknown>;
};

function resolveRunnerLabel(explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const meta = getInjectedAppMeta();
  const fromConfig = meta?.backgroundRunner?.label?.trim();
  if (fromConfig) return fromConfig;
  const id = meta?.id?.trim();
  if (id) return `${id}.background`;
  throw new Error(
    "Background Runner label missing — set app.backgroundRunner.label in appspresso.config or pass label in dispatch().",
  );
}

let pluginChecked = false;
let pluginAvailable = false;

/**
 * Whether `@capacitor/background-runner` is loaded on native platform.
 * `false` on web or when peer is missing.
 */
export async function isBackgroundRunnerAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (pluginChecked) return pluginAvailable;
  pluginChecked = true;
  try {
    const mod = await import("@capacitor/background-runner");
    pluginAvailable = Boolean(mod.BackgroundRunner?.dispatchEvent);
  } catch {
    pluginAvailable = false;
    logger.debug("Background Runner plugin not available");
  }
  return pluginAvailable;
}

/** Triggers runner event from foreground or OS schedule. */
export async function dispatchBackgroundRunnerEvent(
  options: BackgroundRunnerDispatchOptions,
): Promise<unknown> {
  if (!(await isBackgroundRunnerAvailable())) {
    throw new Error(
      "Background Runner is only available on native builds with @capacitor/background-runner installed.",
    );
  }
  const { BackgroundRunner } = await import("@capacitor/background-runner");
  return BackgroundRunner.dispatchEvent({
    label: resolveRunnerLabel(options.label),
    event: options.event,
    details: options.details ?? {},
  });
}
