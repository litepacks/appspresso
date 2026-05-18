import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import {
  closeInAppBrowser,
  isInAppBrowserAvailable,
  type OpenInAppBrowserInternalOptions,
  openInAppBrowserExternal,
  openInAppBrowserInternal,
} from "@/services/in-app-browser.service";

export type UseInAppBrowserResult = {
  /** Plugin on native or web fallback available. */
  available: boolean;
  isNative: boolean;
  /** Opens in default browser. */
  openExternal: (url: string) => Promise<void>;
  /** In-app WebView or system browser. */
  openInternal: (
    url: string,
    options?: OpenInAppBrowserInternalOptions,
  ) => Promise<void>;
  close: () => Promise<void>;
};

/**
 * `@capacitor/inappbrowser` — external, in-app WebView, Custom Tabs / Safari VC.
 * On web: plugin or `window.open` fallback.
 */
export function useInAppBrowser(): UseInAppBrowserResult {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void isInAppBrowserAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openExternal = useCallback(
    (url: string) => openInAppBrowserExternal(url),
    [],
  );

  const openInternal = useCallback(
    (url: string, options?: OpenInAppBrowserInternalOptions) =>
      openInAppBrowserInternal(url, options),
    [],
  );

  const close = useCallback(() => closeInAppBrowser(), []);

  return {
    available,
    isNative: Capacitor.isNativePlatform(),
    openExternal,
    openInternal,
    close,
  };
}

export type {
  InAppBrowserInternalMode,
  OpenInAppBrowserInternalOptions,
} from "@/services/in-app-browser.service";
export { normalizeInAppBrowserUrl } from "@/services/in-app-browser.service";
