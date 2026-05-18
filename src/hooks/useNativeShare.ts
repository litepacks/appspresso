import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import {
  canNativeShareSync,
  isNativeShareAvailable,
  nativeShare,
} from "@/services/native-share.service";

export { isNavigatorShareSupported } from "@/services/native-share.service";

export type UseNativeShareReturn = {
  /** Whether `@capacitor/share` (native) or Web Share API is available */
  supported: boolean;
  isNative: boolean;
  canShare: (data: ShareData) => boolean;
  share: (data: ShareData) => Promise<void>;
  isSharing: boolean;
};

/**
 * Sharing: `@capacitor/share` on native, `navigator.share` on web (Capacitor Share uses this on web too).
 */
export function useNativeShare(): UseNativeShareReturn {
  const [supported, setSupported] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void isNativeShareAvailable().then((ok) => {
      if (!cancelled) setSupported(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const canShare = useCallback(
    (data: ShareData) => canNativeShareSync(data, supported),
    [supported],
  );

  const share = useCallback(async (data: ShareData) => {
    if (!canNativeShareSync(data, supported)) {
      throw new Error(
        supported
          ? "This content cannot be shared."
          : "Sharing is not supported in this environment.",
      );
    }
    setIsSharing(true);
    try {
      await nativeShare(data);
    } finally {
      setIsSharing(false);
    }
  }, [supported]);

  return {
    supported,
    isNative: Capacitor.isNativePlatform(),
    canShare,
    share,
    isSharing,
  };
}
