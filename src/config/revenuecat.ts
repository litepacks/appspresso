import { Capacitor } from "@capacitor/core";
import type { EnvConfig } from "./env";

/** RevenueCat public API key by platform (`VITE_REVENUECAT_*`). */
export function getRevenueCatApiKeyForPlatform(
  env: EnvConfig,
): string | undefined {
  const p = Capacitor.getPlatform();
  if (p === "ios") return env.revenuecatApiKeyIos;
  if (p === "android") return env.revenuecatApiKeyAndroid;
  return undefined;
}
