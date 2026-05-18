import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type DeviceSensorPermissionHint,
  getDeviceOrientationPermissionHint,
  requestDeviceOrientationPermission,
} from "@/lib/device-sensors";

export type DeviceOrientationReading = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
};

export type UseDeviceOrientationOptions = {
  /** When false, listeners are not attached */
  enabled?: boolean;
};

export type UseDeviceOrientationReturn = {
  /** Whether `DeviceOrientationEvent` is available */
  supported: boolean;
  /** Permission after init / user choice */
  permission: DeviceSensorPermissionHint;
  /** Call on user gesture on iOS; listening starts when `true` */
  requestPermission: () => Promise<boolean>;
  /** Last sensor reading */
  reading: DeviceOrientationReading | null;
};

function readEvent(e: DeviceOrientationEvent): DeviceOrientationReading {
  return {
    alpha: e.alpha ?? null,
    beta: e.beta ?? null,
    gamma: e.gamma ?? null,
    absolute: Boolean(e.absolute),
  };
}

/**
 * Device orientation (`deviceorientation`): `alpha` heading, pitch `beta`, roll `gamma`.
 * On iOS Safari use `requestPermission()` from a button.
 */
export function useDeviceOrientation(
  options: UseDeviceOrientationOptions = {},
): UseDeviceOrientationReturn {
  const { enabled = true } = options;

  const hint = useMemo(() => getDeviceOrientationPermissionHint(), []);
  const supported = hint !== "unsupported";

  const [permission, setPermission] =
    useState<DeviceSensorPermissionHint>(hint);
  const [reading, setReading] = useState<DeviceOrientationReading | null>(null);

  const requestPermission = useCallback(async () => {
    const h = getDeviceOrientationPermissionHint();
    if (h === "unsupported") {
      setPermission("unsupported");
      return false;
    }
    if (h === "granted") {
      setPermission("granted");
      return true;
    }
    const ok = await requestDeviceOrientationPermission();
    setPermission(ok ? "granted" : "denied");
    return ok;
  }, []);

  useEffect(() => {
    if (!supported || !enabled) return;
    if (permission !== "granted") return;
    const on = (e: DeviceOrientationEvent) => setReading(readEvent(e));
    window.addEventListener("deviceorientation", on);
    return () => window.removeEventListener("deviceorientation", on);
  }, [supported, enabled, permission]);

  return { supported, permission, requestPermission, reading };
}
