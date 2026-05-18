import { Capacitor } from "@capacitor/core";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { splashWebAnimationLoops } from "@/motion/splash-web-animations";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
} from "@/lib/splash-bootstrap";
import { hideSplashScreen } from "@/services/appearance.service";

const splashImgClass =
  "max-h-44 max-w-[min(88vw,22rem)] object-contain select-none drop-shadow-sm";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type BootstrapLoadingScreenProps = {
  /** Transition animation to main app when `useAppspressoBootstrapPhase() === "exiting"`. */
  exiting?: boolean;
};

/**
 * Full-screen bootstrap / first paint loading UI.
 * Native: same background + logo as native splash; no fade-in; “Loading” appears after native splash hides.
 */
export function BootstrapLoadingScreen({
  exiting = false,
}: BootstrapLoadingScreenProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const isNative = Capacitor.isNativePlatform();
  const timing = useMemo(() => getSplashBootstrapTiming(), []);
  const { webPublicPath: splashUrl, webAnimation: animation, backgroundColor } =
    timing;
  const darkBg = isSplashBackgroundDark(backgroundColor);

  const [nativeRevealed, setNativeRevealed] = useState(!isNative);

  useLayoutEffect(() => {
    applySplashDocumentBackground();
  }, []);

  useEffect(() => {
    if (!isNative || exiting) return;
    let cancelled = false;
    const handoff = () => {
      if (cancelled) return;
      void hideSplashScreen(timing.nativeFadeOutMs).finally(() => {
        if (!cancelled) setNativeRevealed(true);
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(handoff));
    return () => {
      cancelled = true;
    };
  }, [isNative, exiting, timing.nativeFadeOutMs]);

  const loop =
    animation !== "none" ? splashWebAnimationLoops[animation] : undefined;

  const showLoadingLabel = !isNative || nativeRevealed;
  const allowLogoMotion =
    !exiting &&
    reduceMotion !== true &&
    loop !== undefined &&
    (!isNative || nativeRevealed);

  const graphic =
    splashUrl !== undefined ? (
      <img
        src={splashUrl}
        alt=""
        className={splashImgClass}
        decoding="async"
        draggable={false}
      />
    ) : null;

  const animatedGraphic =
    splashUrl !== undefined && allowLogoMotion ? (
      <motion.div className="flex justify-center" initial={false}>
        <motion.div animate={loop.animate} transition={loop.transition}>
          <img
            src={splashUrl}
            alt=""
            className={splashImgClass}
            decoding="async"
            draggable={false}
          />
        </motion.div>
      </motion.div>
    ) : (
      graphic
    );

  const exitMs = timing.exitDurationMs / 1000;
  const motionDisabled = reduceMotion === true;
  const skipContainerFadeIn = isNative && !exiting;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor }}
      initial={motionDisabled || skipContainerFadeIn ? false : { opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={
        motionDisabled
          ? { duration: 0 }
          : exiting
            ? { duration: exitMs, ease: easeOut }
            : skipContainerFadeIn
              ? { duration: 0 }
              : { duration: 0.35, ease: easeOut }
      }
      aria-busy={!exiting}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        {animatedGraphic}
        {showLoadingLabel ? (
          <motion.p
            className={
              darkBg
                ? "max-w-xs text-center text-sm text-white/65 tracking-wide"
                : "max-w-xs text-center text-slate-500 text-sm tracking-wide"
            }
            initial={motionDisabled || isNative ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: exiting ? 0 : 1, y: exiting ? 4 : 0 }}
            transition={{
              duration: motionDisabled ? 0 : exiting ? exitMs : 0.35,
              delay: motionDisabled || exiting || isNative ? 0 : 0.1,
              ease: easeOut,
            }}
          >
            {t("app.loading")}
          </motion.p>
        ) : null}
      </div>
    </motion.div>
  );
}
