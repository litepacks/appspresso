/** Sensor permission: no API; on iOS Safari `prompt` before user gesture */
export type DeviceSensorPermissionHint =
  | "unsupported"
  | "prompt"
  | "granted"
  | "denied";

type WithOptionalStaticRequest = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function ctorHasStaticRequestPermission(
  ctor: unknown,
): ctor is WithOptionalStaticRequest & {
  requestPermission: () => Promise<"granted" | "denied">;
} {
  if (typeof ctor !== "function") return false;
  return (
    typeof (ctor as WithOptionalStaticRequest).requestPermission === "function"
  );
}

export function getDeviceOrientationPermissionHint(): DeviceSensorPermissionHint {
  if (
    typeof window === "undefined" ||
    typeof DeviceOrientationEvent === "undefined"
  ) {
    return "unsupported";
  }
  return ctorHasStaticRequestPermission(DeviceOrientationEvent as unknown)
    ? "prompt"
    : "granted";
}

export function getDeviceMotionPermissionHint(): DeviceSensorPermissionHint {
  if (
    typeof window === "undefined" ||
    typeof DeviceMotionEvent === "undefined"
  ) {
    return "unsupported";
  }
  return ctorHasStaticRequestPermission(DeviceMotionEvent as unknown)
    ? "prompt"
    : "granted";
}

/** Call on user gesture on iOS 13+; `true` if already granted */
export async function requestDeviceOrientationPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  const C = DeviceOrientationEvent as unknown;
  if (ctorHasStaticRequestPermission(C)) {
    const r = await C.requestPermission();
    return r === "granted";
  }
  return true;
}

/** Call on user gesture on iOS 13+; `true` if already granted */
export async function requestDeviceMotionPermission(): Promise<boolean> {
  if (typeof DeviceMotionEvent === "undefined") return false;
  const C = DeviceMotionEvent as unknown;
  if (ctorHasStaticRequestPermission(C)) {
    const r = await C.requestPermission();
    return r === "granted";
  }
  return true;
}
