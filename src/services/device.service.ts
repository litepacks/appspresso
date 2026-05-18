import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { logger } from "@/lib/logger";
import { deviceInfoAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

export async function refreshDeviceInfo(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    appStore.set(deviceInfoAtom, {
      platform: "web",
      model:
        typeof navigator !== "undefined"
          ? navigator.userAgent.slice(0, 80)
          : "web",
    });
    return;
  }
  try {
    const info = await Device.getInfo();
    appStore.set(deviceInfoAtom, {
      platform: info.platform,
      model: `${info.manufacturer ?? ""} ${info.model}`.trim() || info.name,
      osVersion: info.osVersion,
    });
  } catch (e) {
    logger.warn("refreshDeviceInfo", { e: String(e) });
  }
}
