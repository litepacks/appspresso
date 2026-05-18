import { Capacitor } from "@capacitor/core";
import type { LocalNotificationSchema } from "@capacitor/local-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { logger } from "@/lib/logger";
import {
  getPermissionStatus,
  requestPermission,
} from "@/services/permission-manager.service";

export type ScheduleTestNotificationOptions = {
  /** When `prompt`, system permission dialog (default: true) */
  requestPermissionIfNeeded?: boolean;
  /** When >0, schedule notification after this many ms; else immediately */
  delayMs?: number;
};

export type ScheduleTestNotificationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "web" | "denied" | "prompt" | "unavailable" | "schedule_failed";
    };

function nextNotificationId(): number {
  const n = Date.now() % 1_000_000_000;
  return n > 0 ? n : 1;
}

/**
 * Schedules local notification (native only). On web returns `{ ok: false, reason: "web" }`.
 * Opens permission request when `prompt` and `requestPermissionIfNeeded` is not false (`Info.plist` / channels required).
 */
export async function scheduleTestNotification(
  title: string,
  body: string,
  options?: ScheduleTestNotificationOptions,
): Promise<ScheduleTestNotificationResult> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, reason: "web" };
  }

  const requestIfNeeded = options?.requestPermissionIfNeeded !== false;
  let st = await getPermissionStatus("localNotifications");
  if (st === "prompt" && requestIfNeeded) {
    st = await requestPermission("localNotifications");
  }
  if (st !== "granted") {
    if (st === "denied") {
      return { ok: false, reason: "denied" };
    }
    if (st === "prompt") {
      return { ok: false, reason: "prompt" };
    }
    return { ok: false, reason: "unavailable" };
  }

  const delayMs = options?.delayMs ?? 0;
  const notification: LocalNotificationSchema = {
    title,
    body,
    id: nextNotificationId(),
  };
  if (delayMs > 0) {
    notification.schedule = { at: new Date(Date.now() + delayMs) };
  }

  try {
    await LocalNotifications.schedule({
      notifications: [notification],
    });
    return { ok: true };
  } catch (e) {
    logger.warn("scheduleTestNotification", { e: String(e) });
    return { ok: false, reason: "schedule_failed" };
  }
}
