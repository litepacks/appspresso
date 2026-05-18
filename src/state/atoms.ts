import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { JOTAI_STORAGE } from "@/config/constants";
import type { ThemePreference } from "@/config/types";

const jsonStorage = <T>() => createJSONStorage<T>(() => localStorage);

export const hasCompletedOnboardingAtom = atomWithStorage<boolean>(
  JOTAI_STORAGE.onboardingDone,
  false,
  jsonStorage(),
  { getOnInit: true },
);

export const themePreferenceAtom = atomWithStorage<ThemePreference>(
  JOTAI_STORAGE.theme,
  "system",
  jsonStorage(),
  { getOnInit: true },
);

export type AppLifecycleSlice = {
  state: string;
  isActive: boolean;
  source: "web" | "native";
};

export const appLifecycleAtom = atom<AppLifecycleSlice>({
  state: "active",
  isActive: true,
  source: "web",
});

export type DeviceInfoSlice = {
  platform: string;
  model?: string;
  osVersion?: string;
};

export const deviceInfoAtom = atom<DeviceInfoSlice>({ platform: "web" });

export type NetworkSlice = {
  connected: boolean;
  connectionType: string;
};

export const networkStatusAtom = atom<NetworkSlice>({
  connected: true,
  connectionType: "unknown",
});

export type OfflineModeSlice = {
  /** `networkStatusAtom.connected === false` */
  isOffline: boolean;
  connected: boolean;
  connectionType: string;
};

/** Derived read: single source for offline UI / guards. */
export const offlineModeAtom = atom((get): OfflineModeSlice => {
  const n = get(networkStatusAtom);
  return {
    isOffline: !n.connected,
    connected: n.connected,
    connectionType: n.connectionType,
  };
});

export type SqliteSlice = {
  available: boolean;
  messageKey?: string;
};

export const sqliteStatusAtom = atom<SqliteSlice>({ available: false });

export type SyncSlice = {
  pendingCount: number;
  isFlushing: boolean;
  lastFlushAt?: number;
  lastError?: string;
};

export const syncStatusAtom = atom<SyncSlice>({
  pendingCount: 0,
  isFlushing: false,
});

export const purchaseStatusAtom = atom<string>("idle");

/** Bridge for RevenueCat `REVENUECAT_ENTITLEMENT_ID`; updated by `RevenueCatProvider`. */
export const entitlementActiveAtom = atom<boolean>(false);

export const localNotificationStatusAtom = atom<string>("unknown");
export const pushNotificationStatusAtom = atom<string>("unknown");
export const pushNotificationTokenAtom = atom<string | null>(null);
export const lastNotificationAtom = atom<string | null>(null);

export const currentRouteAtom = atom<string>("/");

export const appInfoAtom = atom<{ version: string }>({
  version: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0",
});

export type RuntimeConfigAtomSlice = {
  apiBaseUrlOverride?: string;
};

export const runtimeConfigAtom = atom<RuntimeConfigAtomSlice>({});

/** Updated after `loadRuntimeConfig`; use `useFeatureFlag` in UI. */
export const featureFlagsAtom = atom<Record<string, boolean>>({});

/** Last processed deep link summary (`handleDeepLink`); for demo / diagnostics. */
export type LastDeepLinkSnapshot = {
  rawUrl: string;
  at: number;
  parseOk: boolean;
  route?: string;
};

export const lastDeepLinkSnapshotAtom = atom<LastDeepLinkSnapshot | null>(null);
