import { getEnvConfig, getFeatureFlags, loadRuntimeConfig } from "@/config";
import type { ThemePreference } from "@/config/types";
import { initDatabase } from "@/db/sqlite";
import { logger } from "@/lib/logger";
import { initAppearance } from "@/services/appearance.service";
import { initTelemetry } from "@/services/telemetry.service";
import {
  featureFlagsAtom,
  sqliteStatusAtom,
  themePreferenceAtom,
} from "@/state/atoms";
import { appStore } from "@/state/store";
import { initSyncLayer } from "@/sync/sync.service";
import { resolveTheme } from "@/theme/apply-theme";

function readPrefersDark(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function getInitialResolvedTheme(pref: ThemePreference): "light" | "dark" {
  return resolveTheme(pref, readPrefersDark());
}

export async function runBootstrap(): Promise<void> {
  initTelemetry();
  getEnvConfig();
  await loadRuntimeConfig();
  appStore.set(featureFlagsAtom, getFeatureFlags());

  const pref = appStore.get(themePreferenceAtom);
  const resolved = getInitialResolvedTheme(pref);

  try {
    await initAppearance(resolved);
    await initDatabase((slice) => appStore.set(sqliteStatusAtom, slice));
    initSyncLayer();
  } catch (e) {
    logger.error("bootstrap", { e: String(e) });
  }
}
