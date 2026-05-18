import { useCallback, useMemo } from "react";
import {
  isPhoneDialEnvironment,
  normalizeTelNumber,
  openPhoneDial,
} from "@/lib/phone-dial";

export type UsePhoneDialReturn = {
  /** false when no `window` (SSR) */
  supported: boolean;
  /** Whether compatible with `normalizeTelNumber` */
  canDial: (raw: string) => boolean;
  /** Triggers dial via `tel:`; `true` on success */
  dial: (raw: string) => boolean;
};

/**
 * Opens system phone / dialer via `tel:` URI (mobile and supported desktop).
 */
export function usePhoneDial(): UsePhoneDialReturn {
  const supported = useMemo(() => isPhoneDialEnvironment(), []);

  const canDial = useCallback(
    (raw: string) => normalizeTelNumber(raw) != null,
    [],
  );

  const dial = useCallback((raw: string) => openPhoneDial(raw), []);

  return { supported, canDial, dial };
}

export {
  getTelHref,
  normalizeTelNumber,
  openPhoneDial,
} from "@/lib/phone-dial";
