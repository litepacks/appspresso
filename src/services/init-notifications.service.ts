import { Capacitor } from "@capacitor/core";
import { initPushListeners } from "./push-notification.service";

/**
 * Registers push listeners on native; returns a disposer to remove listeners.
 */
export async function initNotificationBridge(): Promise<() => Promise<void>> {
  if (!Capacitor.isNativePlatform()) {
    return async () => {};
  }
  return initPushListeners();
}
