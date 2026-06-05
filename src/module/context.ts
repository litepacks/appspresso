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
import type { ModuleContext, ModulePlatformInfo } from "./types";

function platformInfo(): ModulePlatformInfo {
  const os = Capacitor.getPlatform();
  return {
    os: os === "ios" || os === "android" ? os : "web",
    isNative: Capacitor.isNativePlatform(),
    isWeb: !Capacitor.isNativePlatform(),
  };
}

export function createModuleContext(authEnabled = true): ModuleContext {
  const env = getEnvConfig();
  const base = {
    platform: platformInfo(),
    logger,
    env,
    config: { package: appspressoPackageConfig },
    events: appEvents,
    featureFlags: () => ({ ...getFeatureFlags() }),
    sqlite: () => ({ ...appStore.get(sqliteStatusAtom) }),
    sync: () => ({ ...appStore.get(syncStatusAtom) }),
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

export function isModuleActiveOnPlatform(
  platforms: readonly ("web" | "native")[],
): boolean {
  const native = Capacitor.isNativePlatform();
  if (native && !platforms.includes("native")) return false;
  if (!native && !platforms.includes("web")) return false;
  return true;
}
