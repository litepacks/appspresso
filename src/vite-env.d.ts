/* global __APP_VERSION__ */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ENABLE_DEBUG_PANEL?: string;
  readonly VITE_GIT_SHA?: string;
  readonly VITE_REVENUECAT_API_KEY_IOS?: string;
  readonly VITE_REVENUECAT_API_KEY_ANDROID?: string;
  /** JSON: `{"flagName":true}` */
  readonly VITE_FEATURE_FLAGS?: string;
  readonly VITE_FEATURE_FLAGS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
