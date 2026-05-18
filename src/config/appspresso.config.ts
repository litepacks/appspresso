import { type EnvConfig, getEnvConfig } from "./env";
import { assertValidPackageConfig } from "./validate";

/**
 * Single package-level defaults (no import.meta reads here).
 * Host apps should customize by editing this file in a fork/vendored copy,
 * or override at runtime where APIs allow.
 */
export const appspressoPackageConfig = {
  mount: {
    rootElementId: "root",
    strictMode: true,
  },
  storage: {
    keyPrefix: "appkit_" as const,
  },
  http: {
    timeoutMs: 15_000,
  },
  iap: {
    productIds: ["premium_monthly", "premium_yearly"] as const,
  },
  deeplink: {
    scheme: "myapp" as const,
  },
  splash: {
    /** Keep in sync with capacitor.config plugins.SplashScreen.backgroundColor */
    backgroundLight: "#ffffff",
    backgroundDark: "#020617",
  },
  revenuecat: {
    entitlementId: "pro" as const,
  },
  orientation: {
    /**
     * `getOrientationSnapshot` / `useOrientation` fallback: when `matchMedia` is missing,
     * portrait when `innerWidth / innerHeight ≤ this ratio`.
     */
    portraitMaxAspectRatio: 1,
  },
} as const;

export type AppspressoPackageConfig = typeof appspressoPackageConfig;

/** Package defaults plus parsed `VITE_*` env (single entry for app/runtime). */
export function getAppspressoConfig(): {
  package: AppspressoPackageConfig;
  env: EnvConfig;
} {
  assertValidPackageConfig(appspressoPackageConfig);
  return {
    package: appspressoPackageConfig,
    env: getEnvConfig(),
  };
}
