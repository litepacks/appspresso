/** Derived from `appspresso.config` — keep storage keys and helpers stable for imports. */
import { appspressoPackageConfig } from "./appspresso.config";

const { storage, http, iap, deeplink, splash, revenuecat } =
  appspressoPackageConfig;

export const STORAGE_KEY_PREFIX = storage.keyPrefix;

export const JOTAI_STORAGE = {
  onboardingDone: `${STORAGE_KEY_PREFIX}app_onboarding_done`,
  theme: `${STORAGE_KEY_PREFIX}app_theme`,
} as const;

export const QUERY_PERSIST_KEY = `${STORAGE_KEY_PREFIX}tanstack_query_cache`;

export const HTTP_TIMEOUT_MS = http.timeoutMs;

export const IAP_PRODUCT_IDS = iap.productIds;

export const REVENUECAT_ENTITLEMENT_ID = revenuecat.entitlementId;

export const DEEPLINK_SCHEME = deeplink.scheme;

export const SPLASH_BACKGROUND_LIGHT = splash.backgroundLight;
export const SPLASH_BACKGROUND_DARK = splash.backgroundDark;

export const SECURE_STORAGE_KEYS = {
  accessToken: `${STORAGE_KEY_PREFIX}auth_access_token`,
  refreshToken: `${STORAGE_KEY_PREFIX}auth_refresh_token`,
} as const;

export const CONSTANTS = {
  STORAGE_KEY_PREFIX,
  HTTP_TIMEOUT_MS,
  DEEPLINK_SCHEME,
  SPLASH_BACKGROUND_LIGHT,
  SPLASH_BACKGROUND_DARK,
} as const;
