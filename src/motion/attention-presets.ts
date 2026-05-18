import type { Transition } from "motion/react";
import type { CSSProperties } from "react";

const easeInOut: [number, number, number, number] = [0.4, 0, 0.2, 1];

export type AttentionPreset = {
  /** Spread onto `motion.*`; optionally use zero on the same keys with `initial`. */
  animate: Record<string, number | string | number[] | string[]>;
  transition: Transition;
  /** e.g. rotation axis for `swing` */
  style?: CSSProperties;
};

/**
 * Short attention-grabbing animations (shake / swing). Not page transitions; single-element emphasis.
 *
 * **Accessibility:** when `useReducedMotion()` is true, skip the animation or keep it static
 * (same approach as `AnimatedOutlet` and `BootstrapLoadingScreen`).
 *
 * @example
 * ```tsx
 * const reduce = useReducedMotion();
 * return (
 *   <motion.div
 *     initial={reduce ? false : { x: 0, rotate: 0 }}
 *     {...(!reduce ? attentionPresets.shake : {})}
 *   >
 * ```
 */
export const attentionPresets = {
  shake: {
    animate: { x: [0, -8, 8, -8, 8, -4, 4, 0] },
    transition: { duration: 0.45, ease: easeInOut },
  },
  swing: {
    style: { transformOrigin: "top center" },
    animate: { rotate: [0, 12, -12, 8, -8, 4, -4, 0] },
    transition: { duration: 0.65, ease: easeInOut },
  },
} satisfies Record<string, AttentionPreset>;

export type AttentionPresetName = keyof typeof attentionPresets;
