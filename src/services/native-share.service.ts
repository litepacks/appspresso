import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/logger";

/** Whether `navigator.share` is available (false in SSR). */
export function isNavigatorShareSupported(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

let pluginChecked = false;
let pluginAvailable = false;

async function isCapacitorSharePluginAvailable(): Promise<boolean> {
  if (pluginChecked) return pluginAvailable;
  pluginChecked = true;
  try {
    const mod = await import("@capacitor/share");
    pluginAvailable = Boolean(mod.Share?.share);
  } catch {
    pluginAvailable = false;
    logger.debug("Share plugin not available");
  }
  return pluginAvailable;
}

/** Native’de `@capacitor/share`, aksi halde Web Share API (varsa). */
export async function isNativeShareAvailable(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    if (await isCapacitorSharePluginAvailable()) return true;
    return isNavigatorShareSupported();
  }
  return isNavigatorShareSupported();
}

function shareDataToCapacitorOptions(
  data: ShareData,
): import("@capacitor/share").ShareOptions {
  return {
    title: data.title,
    text: data.text,
    url: data.url,
  };
}

/**
 * Sync pre-check — when `supported === true`, file sharing needs `navigator.canShare`.
 */
export function canNativeShareSync(
  data: ShareData,
  shareAvailable: boolean,
): boolean {
  if (!shareAvailable) return false;
  const files = data.files;
  if (files?.length) {
    if (!isNavigatorShareSupported()) return false;
    if (typeof navigator.canShare === "function") {
      return navigator.canShare(data);
    }
    return false;
  }
  return true;
}

async function shareViaNavigator(data: ShareData): Promise<void> {
  if (!isNavigatorShareSupported()) {
    throw new Error("Sharing is not supported in this environment.");
  }
  if (data.files?.length && typeof navigator.canShare === "function") {
    if (!navigator.canShare(data)) {
      throw new Error("This content cannot be shared.");
    }
  }
  await navigator.share(data);
}

async function shareViaCapacitor(data: ShareData): Promise<void> {
  const { Share } = await import("@capacitor/share");
  const { value } = await Share.canShare();
  if (!value) {
    throw new Error("Sharing is not supported in this environment.");
  }
  await Share.share(shareDataToCapacitorOptions(data));
}

/**
 * Native `@capacitor/share` first; with files (`File[]`) WebView `navigator.share`,
 * on web only Web Share API.
 */
export async function nativeShare(data: ShareData): Promise<void> {
  const hasFiles = Boolean(data.files?.length);

  if (Capacitor.isNativePlatform() && (await isCapacitorSharePluginAvailable())) {
    if (hasFiles && isNavigatorShareSupported()) {
      try {
        await shareViaNavigator(data);
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") throw e;
        logger.debug("navigator.share files fallback failed", {
          e: String(e),
        });
      }
    }
    if (!hasFiles) {
      await shareViaCapacitor(data);
      return;
    }
    throw new Error(
      "File sharing requires file:// paths or Web Share API support.",
    );
  }

  await shareViaNavigator(data);
}
