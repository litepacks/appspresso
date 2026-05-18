import { Capacitor } from "@capacitor/core";
import { getQueryClient } from "@/app/providers/QueryProvider";
import { clearSession } from "@/auth/session-store";
import { JOTAI_STORAGE, QUERY_PERSIST_KEY } from "@/config/constants";
import { hasCompletedOnboardingAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import { webOutboxClear } from "@/sync/web-outbox";

export function getDebugBuildInfo() {
  return {
    version: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0",
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
  };
}

export async function clearTanstackQueryCache(): Promise<void> {
  getQueryClient().clear();
  localStorage.removeItem(QUERY_PERSIST_KEY);
}

export function clearWebOutbox(): void {
  webOutboxClear();
}

export function resetOnboardingFlag(): void {
  appStore.set(hasCompletedOnboardingAtom, false);
}

export function clearJotaiBrowserStorageKeys(): void {
  localStorage.removeItem(JOTAI_STORAGE.onboardingDone);
  localStorage.removeItem(JOTAI_STORAGE.theme);
}

export async function nuclearResetLocalState(): Promise<void> {
  await clearSession();
  await clearTanstackQueryCache();
  clearWebOutbox();
  clearJotaiBrowserStorageKeys();
  resetOnboardingFlag();
}
