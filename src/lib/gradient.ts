import { cn } from "@/lib/utils";

/**
 * Ready Tailwind classes — match extensions in `appspresso/build/tailwind-preset`
 * `backgroundImage` / `animation` extensions.
 */
export const appspressoGradientBg = {
  /** Brand tones (primary → accent) for UI blocks */
  brand: "bg-appspresso-gradient-brand",
  /** Low opacity; card / hero background */
  brandSoft: "bg-appspresso-gradient-brand-soft",
  /** Neutral background accent */
  mutedWash: "bg-appspresso-gradient-muted-wash",
} as const;

/** Metin gradient’i: `cn(..., appspressoGradientText.base)` — `bg-clip-text text-transparent` dahil */
export const appspressoGradientText = {
  base: "bg-appspresso-gradient-text bg-clip-text text-transparent",
} as const;

/**
 * Slow pan via `background-position`. Only meaningful with `linear-gradient` / `bg-appspresso-*`
 * ; animation off under `motion-reduce`.
 */
export const appspressoGradientMotion = {
  panWide:
    "bg-[length:220%_220%] motion-safe:animate-appspresso-gradient-pan motion-reduce:animate-none",
  panHorizontal:
    "bg-[length:200%_100%] motion-safe:animate-appspresso-gradient-pan motion-reduce:animate-none",
} as const;

export type AppspressoGradientBgKey = keyof typeof appspressoGradientBg;

/**
 * Combines background gradient classes.
 * @param animated - when `true`, adds wide `background-size` + slow pan
 */
export function appspressoGradientBgClass(
  key: AppspressoGradientBgKey,
  options?: { animated?: boolean },
): string {
  const base = appspressoGradientBg[key];
  return cn(base, options?.animated ? appspressoGradientMotion.panWide : null);
}

/** Heading / emphasis: gradient fill + optional pan */
export function appspressoGradientTextClass(options?: {
  animated?: boolean;
}): string {
  return cn(
    appspressoGradientText.base,
    options?.animated ? appspressoGradientMotion.panHorizontal : null,
  );
}
