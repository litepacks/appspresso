/**
 * Typography setup: at the app root, `import "appspresso/theme/index.css"` or equivalent `index.css` defines
 * `--font-sans` / `--font-mono` matching `FONT_CSS_VAR_NAMES`; `appspresso/build/tailwind-preset` maps them to
 * `font-sans` / `font-mono` classes.
 *
 * External fonts (e.g. Inter):
 * 1. Load via `@font-face`, Google Fonts `<link>`, or `@fontsource/inter`.
 * 2. Update `:root { --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif; }`.
 * 3. Optional: `rel="preload"` in `index.html` + `font-display: swap`.
 */
export const FONT_CSS_VAR_NAMES = {
  sans: "--font-sans",
  mono: "--font-mono",
} as const;

export type FontCssVarName =
  (typeof FONT_CSS_VAR_NAMES)[keyof typeof FONT_CSS_VAR_NAMES];
