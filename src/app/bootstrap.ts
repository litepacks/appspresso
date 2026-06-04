import { Capacitor } from "@capacitor/core";
import { getEnvConfig, getFeatureFlags, loadRuntimeConfig } from "@/config";
import type { ThemePreference } from "@/config/types";
import { initDatabase } from "@/db/sqlite";
import { logger } from "@/lib/logger";
import { reportError } from "@/lib/reportError";
import { initAppearance } from "@/services/appearance.service";
import { initTelemetry } from "@/services/telemetry.service";
import {
  bootstrapStatusAtom,
  featureFlagsAtom,
  sqliteStatusAtom,
  themePreferenceAtom,
} from "@/state/atoms";
import { appStore } from "@/state/store";
import { flushNativePendingBuffer, initSyncLayer } from "@/sync/sync.service";
import { resolveTheme } from "@/theme/apply-theme";

function readPrefersDark(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function getInitialResolvedTheme(pref: ThemePreference): "light" | "dark" {
  return resolveTheme(pref, readPrefersDark());
}

/**
 * Native SQLite can block or crash the WebView during cold start on real devices.
 * Run after the bootstrap gate opens the UI (see `useAppspressoBootstrap`).
 */
function scheduleDeferredNativeBootstrap(): void {
  const run = () => {
    void initDatabase((slice) => appStore.set(sqliteStatusAtom, slice))
      .then(() => flushNativePendingBuffer())
      .catch((e) => {
        logger.error("deferred initDatabase", { e: String(e) });
        appStore.set(sqliteStatusAtom, {
          available: false,
          messageKey: "sqlite.error",
        });
      });
  };
  // Let the WebView paint the shell before loading SQLite (reduces OOM on low-RAM devices).
  const delayMs = 4_000;
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => window.setTimeout(run, delayMs));
  } else {
    window.setTimeout(run, delayMs);
  }
}

export function runDeferredNativeBootstrap(): void {
  if (Capacitor.getPlatform() === "web") return;
  scheduleDeferredNativeBootstrap();
}

export async function runBootstrap(): Promise<void> {
  appStore.set(bootstrapStatusAtom, { phase: "running" });
  try {
    initTelemetry();
    getEnvConfig();
    await loadRuntimeConfig();
    appStore.set(featureFlagsAtom, getFeatureFlags());

    const pref = await Promise.resolve(appStore.get(themePreferenceAtom));
    const resolved = getInitialResolvedTheme(pref);

    await initAppearance(resolved);
    if (Capacitor.getPlatform() === "web") {
      await initDatabase((slice) => appStore.set(sqliteStatusAtom, slice));
      await flushNativePendingBuffer();
    }
    initSyncLayer();
    appStore.set(bootstrapStatusAtom, { phase: "ready" });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    appStore.set(bootstrapStatusAtom, { phase: "failed", error });
    reportError(e, { kind: "bootstrap.run" });
    logger.error("bootstrap", { e: error });
    throw e;
  }
}
