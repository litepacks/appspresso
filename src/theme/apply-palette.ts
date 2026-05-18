import type {
  AppspressoThemePalette,
  AppspressoThemePaletteSlots,
} from "@/build/app-meta";

/**
 * Compatible with Tailwind `hsl(var(--token))`: `"H S% L"` (e.g. `"221 83% 53%"`).
 */
export const APSPRESSO_THEME_COLOR_CSS_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
] as const;

export type AppspressoThemeColorCssVar =
  (typeof APSPRESSO_THEME_COLOR_CSS_VARS)[number];

function paletteSlotsToCssVars(
  slots: AppspressoThemePaletteSlots | undefined,
): Partial<Record<AppspressoThemeColorCssVar, string>> {
  if (slots == null) return {};
  const out: Partial<Record<AppspressoThemeColorCssVar, string>> = {};
  for (const [key, value] of Object.entries(slots)) {
    if (value === undefined || value === "") continue;
    const css =
      `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}` as AppspressoThemeColorCssVar;
    if ((APSPRESSO_THEME_COLOR_CSS_VARS as readonly string[]).includes(css)) {
      out[css] = value;
    }
  }
  return out;
}

function paletteHasOverrides(
  palette: AppspressoThemePalette | null | undefined,
): boolean {
  if (palette == null) return false;
  const check = (s: typeof palette.light) =>
    s != null &&
    Object.values(s).some((v) => v !== undefined && String(v).length > 0);
  return check(palette.light) || check(palette.dark);
}

/**
 * Applies `app.theme.palette` from `appspresso.config.ts` on `document.documentElement`.
 * Undefined keys are removed; styles fall back to `:root` / `.dark` in `index.css`.
 */
export function applyAppspressoThemeForMode(
  mode: "light" | "dark",
  palette: AppspressoThemePalette | null | undefined,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (!paletteHasOverrides(palette)) {
    for (const key of APSPRESSO_THEME_COLOR_CSS_VARS) {
      root.style.removeProperty(key);
    }
    return;
  }

  const vars = paletteSlotsToCssVars(
    mode === "light" ? palette?.light : palette?.dark,
  );
  for (const key of APSPRESSO_THEME_COLOR_CSS_VARS) {
    const v = vars[key];
    if (v !== undefined) {
      root.style.setProperty(key, v);
    } else {
      root.style.removeProperty(key);
    }
  }
}
