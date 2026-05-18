import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { logger } from "@/lib/logger";
import { getPermissionStatus } from "@/services/permission-manager.service";
import { lastNotificationAtom, pushNotificationTokenAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

export async function registerForPush(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const st = await getPermissionStatus("pushNotifications");
  if (st !== "granted") return;
  try {
    await PushNotifications.register();
  } catch (e) {
    logger.warn("registerForPush", { e: String(e) });
  }
}

export async function initPushListeners(): Promise<() => Promise<void>> {
  if (!Capacitor.isNativePlatform())
    return async () => {
      /* noop */
    };
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
