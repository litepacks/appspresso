import type { Transition } from "motion/react";

type PageTransitionConfig = {
  initial: Record<string, string | number | Array<string | number>>;
  animate: Record<string, string | number | Array<string | number>>;
  exit: Record<string, string | number | Array<string | number>>;
  transition: Transition;
};

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOut: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** Ready-made Motion presets for React Router page transitions. */
export const pageTransitionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: easeOut },
  },
  fadeSlow: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.35, ease: easeInOut },
  },
  slideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: easeOut },
  },
  slideDown: {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.25, ease: easeOut },
  },
  slideX: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25, ease: easeOut },
  },
  slideXReverse: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.25, ease: easeOut },
  },
  fadeSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.3, ease: easeOut },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.28, ease: easeOut },
  },
  zoomOut: {
    initial: { opacity: 0, scale: 1.04 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.28, ease: easeOut },
  },
  pop: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
  /** Vertical slide with soft spring */
  slideSpring: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.88 },
  },
  /** Bottom clip-path “curtain” reveal (can be costly with heavy content) */
  reveal: {
    initial: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
    animate: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
    transition: { duration: 0.34, ease: easeOut },
  },
  /** Light blur + opacity (keep minimal on low-power devices) */
  blurFade: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(6px)" },
    transition: { duration: 0.3, ease: easeOut },
  },
} satisfies Record<string, PageTransitionConfig>;

export type PageTransitionPreset = keyof typeof pageTransitionPresets;
