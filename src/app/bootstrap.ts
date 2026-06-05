import { Capacitor } from "@capacitor/core";
import { getEnvConfig, getFeatureFlags, loadRuntimeConfig } from "@/config";
import type { ThemePreference } from "@/config/types";
import { logger } from "@/lib/logger";
import { reportError } from "@/lib/reportError";
import { getActivePluginRegistry } from "@/plugin/active-registry";
import { initAppearance } from "@/services/appearance.service";
import { initTelemetry } from "@/services/telemetry.service";
import {
  bootstrapStatusAtom,
  featureFlagsAtom,
  networkStatusAtom,
  sqliteStatusAtom,
  syncStatusAtom,
  themePreferenceAtom,
} from "@/state/atoms";
import { appStore } from "@/state/store";
import { initSyncLayer } from "@/sync/sync-lifecycle";
import { bootTrace } from "@/lib/boot-trace";
import { isNativeDebugEnabled } from "@/lib/native-debug";
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
 * Resolves when `task` settles or after `ms`, whichever comes first — never
 * rejects. Capacitor plugin calls can hang indefinitely when the native bridge
 * delivers callbacks late (seen on old Android System WebView builds where the
 * native side fires `window.Capacitor.triggerEvent` before the bridge is ready).
 * Cosmetic startup work must never block the bootstrap gate from opening.
 */
async function settleWithin(
  task: Promise<unknown>,
  ms: number,
  label: string,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      bootTrace("bootstrap.step.timeout", { step: label, ms });
      logger.warn("bootstrap step timed out, continuing", { step: label, ms });
      resolve();
    }, ms);
  });
  try {
    // A genuine rejection still propagates (fails bootstrap); only an
    // unresolved (hung) promise is bypassed once the timeout wins the race.
    await Promise.race([task, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Native SQLite can block or crash the WebView during cold start on real devices.
 * Run after the bootstrap gate opens the UI (see `useAppspressoBootstrap`).
 */
function scheduleDeferredNativeBootstrap(): void {
  bootTrace("bootstrap.deferred-native.scheduled", { delayMs: 4_000 });
  const run = () => {
    bootTrace("bootstrap.deferred-native.sqlite.import.start");
    void import("@/db/sqlite")
      .then(({ initDatabase }) => {
        bootTrace("bootstrap.deferred-native.sqlite.init.start");
        return initDatabase((slice) => appStore.set(sqliteStatusAtom, slice));
      })
      .then(() => {
        bootTrace("bootstrap.deferred-native.flush-buffer.start");
        return import("@/sync/sync.service").then((m) =>
          m.flushNativePendingBuffer(),
        );
      })
      .then(() => bootTrace("bootstrap.deferred-native.done"))
      .catch((e) => {
        bootTrace("bootstrap.deferred-native.error", { e: String(e) });
        logger.error("deferred initDatabase", { e: String(e) });
        appStore.set(sqliteStatusAtom, {
          available: false,
          messageKey: "sqlite.error",
        });
      });
  };
  // Let the WebView paint the shell before loading SQLite (reduces OOM on low-RAM devices).
  const delayMs = 8_000;
  window.setTimeout(run, delayMs);
}

export function runDeferredNativeBootstrap(): void {
  if (Capacitor.getPlatform() === "web") return;
  scheduleDeferredNativeBootstrap();
}

function logBootstrapStartupSummary(): void {
  const bootstrap = appStore.get(bootstrapStatusAtom);
  const sqlite = appStore.get(sqliteStatusAtom);
  const sync = appStore.get(syncStatusAtom);
  const network = appStore.get(networkStatusAtom);
  logger.info("bootstrap.startup", {
    phase: bootstrap.phase,
    platform: Capacitor.getPlatform(),
    sqliteAvailable: sqlite.available,
    sqliteMessageKey: sqlite.messageKey,
    syncPending: sync.pendingCount,
    networkConnected: network.connected,
    connectionType: network.connectionType,
  });
}

export async function runBootstrap(): Promise<void> {
  bootTrace("bootstrap.run.start", { platform: Capacitor.getPlatform() });
  appStore.set(bootstrapStatusAtom, { phase: "running" });
  try {
    bootTrace("bootstrap.initTelemetry");
    initTelemetry();
    bootTrace("bootstrap.getEnvConfig");
    getEnvConfig();
    bootTrace("bootstrap.loadRuntimeConfig.start");
    await loadRuntimeConfig();
    bootTrace("bootstrap.loadRuntimeConfig.done");
    appStore.set(featureFlagsAtom, getFeatureFlags());

    const registry = getActivePluginRegistry();
    if (registry) {
      bootTrace("bootstrap.plugins.runOnBootstrapAll.start");
      await registry.runOnBootstrapAll();
      bootTrace("bootstrap.plugins.runOnBootstrapAll.done");
    }

    const pref = await Promise.resolve(appStore.get(themePreferenceAtom));
    const resolved = getInitialResolvedTheme(pref);

    bootTrace("bootstrap.initAppearance.start", { theme: resolved });
    await settleWithin(initAppearance(resolved), 2500, "initAppearance");
    bootTrace("bootstrap.initAppearance.done");
    if (Capacitor.getPlatform() === "web") {
      bootTrace("bootstrap.web.sqlite.start");
      const { initDatabase } = await import("@/db/sqlite");
      await initDatabase((slice) => appStore.set(sqliteStatusAtom, slice));
      const { flushNativePendingBuffer } = await import("@/sync/sync.service");
      await flushNativePendingBuffer();
      bootTrace("bootstrap.web.sqlite.done");
    }
    bootTrace("bootstrap.initSyncLayer.start");
    initSyncLayer();
    bootTrace("bootstrap.initSyncLayer.done");
    appStore.set(bootstrapStatusAtom, { phase: "ready" });
    bootTrace("bootstrap.run.ready");
    if (isNativeDebugEnabled()) {
      logBootstrapStartupSummary();
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    bootTrace("bootstrap.run.failed", { error });
    appStore.set(bootstrapStatusAtom, { phase: "failed", error });
    reportError(e, { kind: "bootstrap.run" });
    logger.error("bootstrap", { e: error });
    throw e;
  }
}
