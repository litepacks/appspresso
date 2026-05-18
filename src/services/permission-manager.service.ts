import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { logger } from "@/lib/logger";
import type {
  AppPermission,
  UnifiedPermissionStatus,
} from "@/permissions/types";

export async function getPermissionStatus(
  kind: AppPermission,
): Promise<UnifiedPermissionStatus> {
  if (!Capacitor.isNativePlatform()) return "unavailable";
  try {
    if (kind === "localNotifications") {
      const r = await LocalNotifications.checkPermissions();
      return mapNotif(r.display);
    }
    const r = await PushNotifications.checkPermissions();
    return mapNotif(r.receive);
  } catch (e) {
    logger.warn("getPermissionStatus", { kind, e: String(e) });
    return "unavailable";
  }
}

export async function requestPermission(
  kind: AppPermission,
): Promise<UnifiedPermissionStatus> {
  if (!Capacitor.isNativePlatform()) return "unavailable";
  try {
    if (kind === "localNotifications") {
      const r = await LocalNotifications.requestPermissions();
      return mapNotif(r.display);
    }
    const r = await PushNotifications.requestPermissions();
    return mapNotif(r.receive);
  } catch (e) {
    logger.warn("requestPermission", { kind, e: String(e) });
    return "denied";
  }
}

function mapNotif(v: string): UnifiedPermissionStatus {
  if (v === "granted") return "granted";
  if (v === "denied") return "denied";
  if (v === "prompt") return "prompt";
  return "unavailable";
}
