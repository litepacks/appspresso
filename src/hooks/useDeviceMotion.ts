import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type DeviceSensorPermissionHint,
  getDeviceMotionPermissionHint,
  requestDeviceMotionPermission,
} from "@/lib/device-sensors";

export type DeviceMotionAcceleration = {
  x: number | null;
  y: number | null;
  z: number | null;
};

export type DeviceMotionRotationRate = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

export type DeviceMotionReading = {
  acceleration: DeviceMotionAcceleration | null;
  accelerationIncludingGravity: DeviceMotionAcceleration | null;
  rotationRate: DeviceMotionRotationRate | null;
  interval: number | null;
};

export type UseDeviceMotionOptions = {
  enabled?: boolean;
};

export type UseDeviceMotionReturn = {
  supported: boolean;
  permission: DeviceSensorPermissionHint;
  requestPermission: () => Promise<boolean>;
  reading: DeviceMotionReading | null;
};

function readAccel(
  a: DeviceMotionEventAcceleration | null,
): DeviceMotionAcceleration | null {
  if (a == null) return null;
  return { x: a.x ?? null, y: a.y ?? null, z: a.z ?? null };
}

function readRotation(
  r: DeviceMotionEventRotationRate | null,
): DeviceMotionRotationRate | null {
  if (r == null) return null;
  return {
    alpha: r.alpha ?? null,
    beta: r.beta ?? null,
    gamma: r.gamma ?? null,
  };
}

function readEvent(e: DeviceMotionEvent): DeviceMotionReading {
  return {
    acceleration: readAccel(e.acceleration),
    accelerationIncludingGravity: readAccel(e.accelerationIncludingGravity),
    rotationRate: readRotation(e.rotationRate),
    interval: Number.isFinite(e.interval) ? e.interval : null,
  };
}

/**
 * Acceleration and gyro (`devicemotion`). On iOS Safari call `requestPermission()` on user gesture.
 */
export function useDeviceMotion(
  options: UseDeviceMotionOptions = {},
): UseDeviceMotionReturn {
  const { enabled = true } = options;

  const hint = useMemo(() => getDeviceMotionPermissionHint(), []);
  const supported = hint !== "unsupported";

  const [permission, setPermission] =
    useState<DeviceSensorPermissionHint>(hint);
  const [reading, setReading] = useState<DeviceMotionReading | null>(null);

  const requestPermission = useCallback(async () => {
    const h = getDeviceMotionPermissionHint();
    if (h === "unsupported") {
      setPermission("unsupported");
      return false;
    }
    if (h === "granted") {
      setPermission("granted");
      return true;
    }
    const ok = await requestDeviceMotionPermission();
    setPermission(ok ? "granted" : "denied");
    return ok;
  }, []);

  useEffect(() => {
    if (!supported || !enabled) return;
    if (permission !== "granted") return;
    const on = (e: DeviceMotionEvent) => setReading(readEvent(e));
    window.addEventListener("devicemotion", on);
    return () => window.removeEventListener("devicemotion", on);
  }, [supported, enabled, permission]);

  return { supported, permission, requestPermission, reading };
}
