import { logger } from "@/lib/logger";
import { getEnvConfig } from "./env";
import {
  type FeatureFlagsRecord,
  parseFeatureFlagsFromResponseBody,
  resolveFeatureFlag,
} from "./feature-flags";
import type { RuntimeConfig } from "./types";

let runtimeCache: RuntimeConfig = {};

const trim = (v: string | undefined): string | undefined => {
  if (v === undefined || v === "") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
};

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const env = getEnvConfig();
  let flags: FeatureFlagsRecord = { ...(env.featureFlags ?? {}) };

  const url = trim(import.meta.env.VITE_FEATURE_FLAGS_URL);
  if (url) {
    try {
      const res = await fetch(url, {
        credentials: "omit",
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const raw: unknown = await res.json();
        const remote = parseFeatureFlagsFromResponseBody(raw);
        if (remote) {
          flags = { ...flags, ...remote };
        } else {
          logger.warn(
            "Appspresso: remote feature flags body is not in the expected shape",
          );
        }
      } else {
        logger.warn("Appspresso: feature flags URL response failed", {
          status: res.status,
        });
      }
    } catch (e) {
      logger.warn("Appspresso: could not load feature flags remotely", {
        e: String(e),
      });
    }
  }

  runtimeCache = {
    ...runtimeCache,
    featureFlags: flags,
  };
  return runtimeCache;
}

export function getRuntimeConfig(): RuntimeConfig {
  return runtimeCache;
}

export function getEffectiveApiBaseUrl(): string {
  const env = getEnvConfig();
  const override = runtimeCache.apiBaseUrlOverride;
  const base = override ?? env.apiBaseUrl;
  return base ?? "";
}

/** Current flags after `loadRuntimeConfig` completes (or `{}`). */
export function getFeatureFlags(): FeatureFlagsRecord {
  return runtimeCache.featureFlags ?? {};
}

export function isFeatureEnabled(
  flagKey: string,
  defaultValue = false,
): boolean {
  return resolveFeatureFlag(getFeatureFlags(), flagKey, defaultValue);
}
