import { logger } from "@/lib/logger";
import { parseFeatureFlagsJson } from "./feature-flags";
import { assertValidEnvConfig } from "./validate";

const trim = (v: string | undefined): string | undefined => {
  if (v === undefined || v === "") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
};

export type EnvConfig = {
  apiBaseUrl?: string;
  sentryDsn?: string;
  enableDebugPanel?: boolean;
  gitSha?: string;
  /** RevenueCat public SDK key (iOS). */
  revenuecatApiKeyIos?: string;
  /** RevenueCat public SDK key (Android). */
  revenuecatApiKeyAndroid?: string;
  /**
   * Local defaults: `VITE_FEATURE_FLAGS` JSON (`{"betaFlow":true}`).
   * Remote load updates the same keys (`VITE_FEATURE_FLAGS_URL`).
   */
  featureFlags?: Record<string, boolean>;
};

export function getEnvConfig(): EnvConfig {
  const rawFlags = trim(import.meta.env.VITE_FEATURE_FLAGS);
  let featureFlags: Record<string, boolean> | undefined;
  if (rawFlags) {
    const parsed = parseFeatureFlagsJson(rawFlags);
    if (parsed) {
      featureFlags = parsed;
    } else {
      logger.warn("Appspresso: VITE_FEATURE_FLAGS is not a valid JSON object");
    }
  }

  const cfg: EnvConfig = {
    apiBaseUrl: trim(import.meta.env.VITE_API_BASE_URL),
    sentryDsn: trim(import.meta.env.VITE_SENTRY_DSN),
    enableDebugPanel: import.meta.env.VITE_ENABLE_DEBUG_PANEL === "true",
    gitSha: trim(import.meta.env.VITE_GIT_SHA),
    revenuecatApiKeyIos: trim(import.meta.env.VITE_REVENUECAT_API_KEY_IOS),
    revenuecatApiKeyAndroid: trim(
      import.meta.env.VITE_REVENUECAT_API_KEY_ANDROID,
    ),
    featureFlags,
  };
  assertValidEnvConfig(cfg);
  return cfg;
}
