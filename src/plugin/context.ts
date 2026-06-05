import { Capacitor } from "@capacitor/core";
import { appEvents } from "@/app/events";
import {
  getAuthPluginSnapshot,
  subscribeAuthPluginSnapshot,
} from "@/auth/plugin-bridge";
import { appspressoPackageConfig } from "@/config/appspresso.config";
import { getEnvConfig } from "@/config/env";
import { getFeatureFlags } from "@/config/runtime";
import { type I18nJsonBundles, mergeI18nJsonBundles } from "@/i18n";
import { logger } from "@/lib/logger";
import {
  featureFlagsAtom,
  sqliteStatusAtom,
  syncStatusAtom,
} from "@/state/atoms";
import { appStore } from "@/state/store";
import type { HostCapabilitySnapshot } from "./capabilities";
import type {
  AnalyticsSink,
  ErrorReporter,
  PluginContext,
  PluginPlatformInfo,
} from "./types";

const errorReporters = new Set<ErrorReporter>();
const analyticsSinks = new Set<AnalyticsSink>();

/** @internal Chained from `captureException`. */
export function runPluginErrorReporters(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  for (const reporter of errorReporters) {
    try {
      reporter(error, context);
    } catch (e) {
      logger.error("plugin.errorReporter", { e: String(e) });
    }
  }
}

/** @internal */
export function runPluginAnalyticsTrack(
  event: string,
  properties?: Record<string, unknown>,
): void {
  for (const sink of analyticsSinks) {
    try {
      sink.track(event, properties);
    } catch (e) {
      logger.error("plugin.analytics", { e: String(e) });
    }
  }
}

export function resetPluginRuntimeState(): void {
  errorReporters.clear();
  analyticsSinks.clear();
}

function platformInfo(host: HostCapabilitySnapshot): PluginPlatformInfo {
  return {
    os: host.platform,
    isNative: host.isNative,
    isWeb: host.isWeb,
  };
}

export function createPluginContext(
  host: HostCapabilitySnapshot,
): PluginContext {
  const env = getEnvConfig();
  const authEnabled = host.capabilities.has("auth");

  const base = {
    platform: platformInfo(host),
    logger,
    env,
    config: { package: appspressoPackageConfig },
    events: appEvents,
    featureFlags: () => ({ ...getFeatureFlags() }),
    sqlite: () => ({ ...appStore.get(sqliteStatusAtom) }),
    sync: () => ({ ...appStore.get(syncStatusAtom) }),
    registerErrorReporter(reporter: import("./types").ErrorReporter) {
      errorReporters.add(reporter);
      return () => {
        errorReporters.delete(reporter);
      };
    },
    registerAnalytics(sink: import("./types").AnalyticsSink) {
      analyticsSinks.add(sink);
      return () => {
        analyticsSinks.delete(sink);
      };
    },
    mergeFeatureFlags(flags: Record<string, boolean>) {
      const prev = appStore.get(featureFlagsAtom);
      appStore.set(featureFlagsAtom, { ...prev, ...flags });
    },
    mergeI18n(bundles: I18nJsonBundles) {
      mergeI18nJsonBundles(bundles);
    },
  };

  if (authEnabled) {
    return {
      ...base,
      auth: {
        getSnapshot: getAuthPluginSnapshot,
        onChange: subscribeAuthPluginSnapshot,
      },
    };
  }

  return base;
}

/** Platform gate: skip plugin when not in `platforms` list. */
export function isPluginActiveOnPlatform(
  platforms: readonly ("web" | "native")[],
): boolean {
  const native = Capacitor.isNativePlatform();
  if (native && !platforms.includes("native")) return false;
  if (!native && !platforms.includes("web")) return false;
  return true;
}
