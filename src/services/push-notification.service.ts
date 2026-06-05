import { Capacitor } from "@capacitor/core";
import type { PushNotifications as PushNotificationsPlugin } from "@capacitor/push-notifications";
import { logger } from "@/lib/logger";
import { getPermissionStatus } from "@/services/permission-manager.service";
import { lastNotificationAtom, pushNotificationTokenAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const NOOP = async () => {
  /* noop */
};

/**
 * Resolves `@capacitor/push-notifications` only when the native plugin is
 * registered. Returns null on web or when the optional peer is not installed
 * in the native shell (avoids "plugin is not implemented" rejections).
 */
async function loadPushNotifications(): Promise<typeof PushNotificationsPlugin | null> {
  if (!Capacitor.isNativePlatform()) return null;
  if (!Capacitor.isPluginAvailable("PushNotifications")) {
    logger.debug("PushNotifications plugin not available in native shell");
    return null;
  }
  try {
    const mod = await import("@capacitor/push-notifications");
    return mod.PushNotifications;
  } catch (e) {
    logger.debug("PushNotifications import failed", { e: String(e) });
    return null;
  }
}

export async function registerForPush(): Promise<void> {
  const PushNotifications = await loadPushNotifications();
  if (!PushNotifications) return;
  const st = await getPermissionStatus("pushNotifications");
  if (st !== "granted") return;
  try {
    await PushNotifications.register();
  } catch (e) {
    logger.warn("registerForPush", { e: String(e) });
  }
}

export async function initPushListeners(): Promise<() => Promise<void>> {
  const PushNotifications = await loadPushNotifications();
  if (!PushNotifications) return NOOP;
  const reg = await PushNotifications.addListener("registration", (t) => {
    appStore.set(pushNotificationTokenAtom, t.value);
  });
  const err = await PushNotifications.addListener("registrationError", () => {
    appStore.set(pushNotificationTokenAtom, null);
  });
  const action = await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (e) => {
      appStore.set(
        lastNotificationAtom,
        e.notification.title ?? "notification",
      );
    },
  );
  return async () => {
    await reg.remove();
    await err.remove();
    await action.remove();
  };
}
