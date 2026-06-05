import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
} from "@/lib/splash-bootstrap";
import { hideSplashScreen } from "@/services/appearance.service";
import { bootTrace } from "@/lib/boot-trace";
import type { BootstrapLoadingScreenProps } from "./BootstrapLoadingScreen";

const splashImgClass =
  "max-h-44 max-w-[min(88vw,22rem)] object-contain select-none drop-shadow-sm";

/** Native bootstrap UI without `motion` — keeps WebView heap lower on low-RAM devices. */
export function BootstrapLoadingScreenNative({
  exiting = false,
}: BootstrapLoadingScreenProps) {
  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const { webPublicPath: splashUrl, backgroundColor } = timing;
  const darkBg = isSplashBackgroundDark(backgroundColor);
  const [nativeRevealed, setNativeRevealed] = useState(false);

  useLayoutEffect(() => {
    applySplashDocumentBackground();
  }, []);

  useEffect(() => {
    if (exiting) return;
    bootTrace("bootstrap.native-loading.mount");
    let cancelled = false;
    // Immediate attempt before rAF — helps when the bridge is ready early.
    void hideSplashScreen();
    const handoff = () => {
      if (cancelled) return;
      // Fire-and-forget: `SplashScreen.hide()` can hang if the native bridge
      // stalls; revealing the web UI must not wait on it.
      void hideSplashScreen();
      setNativeRevealed(true);
      bootTrace("bootstrap.native-loading.revealed");
    };
    requestAnimationFrame(() => requestAnimationFrame(handoff));
    return () => {
      cancelled = true;
    };
  }, [exiting]);

  const showLoadingLabel = nativeRevealed;
  const exitMs = timing.exitDurationMs;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6 transition-opacity"
      style={{
        backgroundColor,
        opacity: exiting ? 0 : 1,
        transitionDuration: exiting ? `${exitMs}ms` : "0ms",
      }}
      aria-busy={!exiting}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        {splashUrl !== undefined ? (
          <img
            src={splashUrl}
            alt=""
            className={splashImgClass}
            decoding="async"
            draggable={false}
          />
        ) : null}
        {showLoadingLabel ? (
          <p
            className={
              darkBg
                ? "max-w-xs text-center text-sm text-white/65 tracking-wide"
                : "max-w-xs text-center text-slate-500 text-sm tracking-wide"
            }
          >
            Loading…
          </p>
        ) : null}
      </div>
    </div>
  );
}
