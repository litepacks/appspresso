import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { Capacitor } from "@capacitor/core";
import { STORAGE_KEY_PREFIX } from "@/config/constants";
import { logger } from "@/lib/logger";
import { reportError } from "@/lib/reportError";

const isNative = Capacitor.isNativePlatform();

const mem = new Map<string, string>();

export async function secureStorageGet(key: string): Promise<string | null> {
  if (!isNative) {
    try {
      return sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStorage.getItem(key);
  } catch (e) {
    logger.warn("secureStorageGet", { key, e: String(e) });
    reportError(e, { kind: "secureStorage.fallback", op: "get", key });
    return mem.get(key) ?? null;
  }
}

export async function secureStorageSet(
  key: string,
  value: string,
): Promise<void> {
  if (!isNative) {
    try {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, value);
    } catch (e) {
      logger.warn("secureStorageSet web", { e: String(e) });
    }
    return;
  }
  try {
    await SecureStorage.setItem(key, value);
  } catch (e) {
    logger.warn("secureStorageSet", { key, e: String(e) });
    reportError(e, { kind: "secureStorage.fallback", op: "set", key });
    mem.set(key, value);
  }
}

export async function secureStorageRemove(key: string): Promise<void> {
  if (!isNative) {
    try {
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await SecureStorage.removeItem(key);
  } catch (e) {
    logger.warn("secureStorageRemove", { key, e: String(e) });
    mem.delete(key);
  }
}
