import type { AppspressoSplashMeta } from "@/build/app-meta";
import { getInjectedAppMeta } from "@/build/injected-app-meta";
import {
  SPLASH_BACKGROUND_DARK,
  SPLASH_BACKGROUND_LIGHT,
} from "@/config/constants";
import type { SplashWebAnimationKind } from "@/motion/splash-web-animations";

function parseSplashWebAnimation(
  raw: string | undefined,
): SplashWebAnimationKind {
  const v = raw?.trim().toLowerCase();
  if (
    v === "pulse" ||
    v === "float" ||
    v === "breathe" ||
    v === "sway" ||
    v === "glow"
  ) {
    return v;
  }
  return "none";
}

const DEFAULT_MIN_MS = 900;
const DEFAULT_EXIT_MS = 450;
const DEFAULT_NATIVE_FADE_MS = 450;
/** Hide native splash if JS never runs (stuck bridge). */
export const SPLASH_NATIVE_FALLBACK_HIDE_MS = 4_000;

export type SplashBootstrapTiming = {
  minDisplayMs: number;
  exitDurationMs: number;
  nativeFadeOutMs: number;
  backgroundColor: string;
  webPublicPath?: string;
  webAnimation: SplashWebAnimationKind;
};

function readSplashMeta(): AppspressoSplashMeta | undefined {
  return getInjectedAppMeta()?.splash;
}

function readPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getSplashBootstrapTiming(): SplashBootstrapTiming {
  const splash = readSplashMeta();
  const prefersDark = readPrefersDark();
  return {
    minDisplayMs: splash?.webBootstrapMinDurationMs ?? DEFAULT_MIN_MS,
    exitDurationMs: splash?.webExitDurationMs ?? DEFAULT_EXIT_MS,
    nativeFadeOutMs: splash?.launchFadeOutDuration ?? DEFAULT_NATIVE_FADE_MS,
    backgroundColor:
      splash?.backgroundColor ??
      (prefersDark ? SPLASH_BACKGROUND_DARK : SPLASH_BACKGROUND_LIGHT),
    webPublicPath: splash?.webPublicPath?.trim() || undefined,
    webAnimation: parseSplashWebAnimation(splash?.webAnimation),
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Pre-first-paint `html`/`body` — prevents white flash between native splash and web bootstrap. */
export function applySplashDocumentBackground(): void {
  if (typeof document === "undefined") return;
  const { backgroundColor } = getSplashBootstrapTiming();
  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
}

export function isSplashBackgroundDark(backgroundColor: string): boolean {
  const hex = backgroundColor.trim().replace(/^#/, "");
  if (hex.length !== 6) return false;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
