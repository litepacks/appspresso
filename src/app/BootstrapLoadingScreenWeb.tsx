import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { BootstrapLoadingScreenProps } from "@/app/BootstrapLoadingScreen";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
} from "@/lib/splash-bootstrap";
import { splashWebAnimationLoops } from "@/motion/splash-web-animations";

const splashImgClass =
  "max-h-44 max-w-[min(88vw,22rem)] object-contain select-none drop-shadow-sm";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Web bootstrap with Motion transitions. */
export function BootstrapLoadingScreenWeb({
  exiting = false,
}: BootstrapLoadingScreenProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
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

  const loop =
    animation !== "none" ? splashWebAnimationLoops[animation] : undefined;

  const showLoadingLabel = true;
  const allowLogoMotion =
    !exiting && reduceMotion !== true && loop !== undefined;

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

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor }}
      initial={motionDisabled ? false : { opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={
        motionDisabled
          ? { duration: 0 }
          : exiting
            ? { duration: exitMs, ease: easeOut }
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
            initial={motionDisabled ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: exiting ? 0 : 1, y: exiting ? 4 : 0 }}
            transition={{
              duration: motionDisabled ? 0 : exiting ? exitMs : 0.35,
              delay: motionDisabled || exiting ? 0 : 0.1,
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
