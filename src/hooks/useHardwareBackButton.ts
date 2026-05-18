import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import type { HardwareBackHandler } from "@/lib/hardware-back";
import { registerHardwareBackHandler } from "@/lib/hardware-back";

/**
 * Android back button: last registered handler runs first.
 * When handler returns `true`, default (history / minimize) is skipped.
 * Web ve iOS’ta no-op.
 */
export function useHardwareBackButton(
  handler: HardwareBackHandler,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== "android" ||
      !enabled
    ) {
      return;
    }
    return registerHardwareBackHandler((e) => handlerRef.current(e));
  }, [enabled]);
}
