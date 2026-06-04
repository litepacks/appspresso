import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
} from "@/lib/splash-bootstrap";
import { hideSplashScreen } from "@/services/appearance.service";
import type { BootstrapLoadingScreenProps } from "./BootstrapLoadingScreen";

const splashImgClass =
  "max-h-44 max-w-[min(88vw,22rem)] object-contain select-none drop-shadow-sm";

/** Native bootstrap UI without `motion` — keeps WebView heap lower on low-RAM devices. */
export function BootstrapLoadingScreenNative({
  exiting = false,
}: BootstrapLoadingScreenProps) {
  const { t } = useTranslation();
  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const {
    webPublicPath: splashUrl,
    backgroundColor,
  } = timing;
  const darkBg = isSplashBackgroundDark(backgroundColor);
  const [nativeRevealed, setNativeRevealed] = useState(false);

  useLayoutEffect(() => {
    applySplashDocumentBackground();
  }, []);

  useEffect(() => {
    if (exiting) return;
    let cancelled = false;
    const handoff = () => {
      if (cancelled) return;
      void hideSplashScreen().finally(() => {
        if (!cancelled) setNativeRevealed(true);
      });
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
            {t("app.loading")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
