import type { Transition } from "motion/react";

const easeInOut: [number, number, number, number] = [0.4, 0, 0.2, 1];

export type SplashWebAnimationKind =
  | "none"
  | "pulse"
  | "float"
  | "breathe"
  | "sway"
  | "glow";

export type SplashWebMotionLoop = {
  animate: Record<string, string | number | Array<string | number>>;
  transition: Transition;
};

/** Continuous (loop) Motion presets for the `BootstrapLoadingScreen` graphic wrapper. */
export const splashWebAnimationLoops: Record<
  Exclude<SplashWebAnimationKind, "none">,
  SplashWebMotionLoop
> = {
  pulse: {
    animate: { scale: [1, 1.07, 1] },
    transition: {
      duration: 1.75,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
  float: {
    animate: { y: [0, -8, 0], opacity: [0.88, 1, 0.88] },
    transition: {
      duration: 2.25,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
  breathe: {
    animate: { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] },
    transition: {
      duration: 2.2,
      repeat: Number.POSITIVE_INFINITY,
      ease: easeInOut,
    },
  },
  sway: {
    animate: { y: [0, -5, 0], rotate: [0, -1.25, 0, 1.25, 0] },
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
  glow: {
    animate: {
      scale: [1, 1.035, 1],
      filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
    },
    transition: {
      duration: 2.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export function parseSplashWebAnimation(
  value: unknown,
): SplashWebAnimationKind {
  if (
    value === "pulse" ||
    value === "float" ||
    value === "breathe" ||
    value === "sway" ||
    value === "glow"
  ) {
    return value;
  }
  if (value === "none") return "none";
  return "none";
}
