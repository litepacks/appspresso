import { useLayoutEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { BootstrapLoadingScreenProps } from "@/app/BootstrapLoadingScreen";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
} from "@/lib/splash-bootstrap";

const splashImgClass =
  "max-h-44 max-w-[min(88vw,22rem)] object-contain select-none drop-shadow-sm";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getAnimationClass(
  animation: string | undefined,
): string | undefined {
  if (prefersReducedMotion()) return undefined;
  switch (animation) {
    case "pulse":
      return "animate-splash-pulse";
    case "breathe":
      return "animate-splash-breathe";
    case "float":
      return "animate-splash-float";
    case "sway":
      return "animate-splash-sway";
    case "glow":
      return "animate-splash-glow";
    default:
      return undefined;
  }
}

/** Web bootstrap with CSS-only transitions (no framer-motion). */
export function BootstrapLoadingScreenWeb({
  exiting = false,
}: BootstrapLoadingScreenProps) {
  const { t } = useTranslation();
  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const {
    webPublicPath: splashUrl,
    webAnimation: animation,
    backgroundColor,
  } = timing;
  const darkBg = isSplashBackgroundDark(backgroundColor);

  useLayoutEffect(() => {
    applySplashDocumentBackground();
  }, []);

  const animClass = getAnimationClass(animation);
  const exitMs = timing.exitDurationMs;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6"
      style={{
        backgroundColor,
        opacity: exiting ? 0 : 1,
        transition: `opacity ${exitMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      aria-busy={!exiting}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        {splashUrl !== undefined ? (
          <div className="flex justify-center">
            <div className={animClass}>
              <img
                src={splashUrl}
                alt=""
                className={splashImgClass}
                decoding="async"
                draggable={false}
              />
            </div>
          </div>
        ) : null}
        <p
          className={
            darkBg
              ? "max-w-xs text-center text-sm text-white/65 tracking-wide"
              : "max-w-xs text-center text-slate-500 text-sm tracking-wide"
          }
          style={{
            opacity: exiting ? 0 : 1,
            transform: exiting ? "translateY(4px)" : "translateY(0)",
            transition: `opacity ${exitMs}ms ease, transform ${exitMs}ms ease`,
          }}
        >
          {t("app.loading")}
        </p>
      </div>
    </div>
  );
}
