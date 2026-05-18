/**
 * Demo translations: `src/locales/<namespace>/<lng>.json`
 * (e.g. `locales/demo/en.json`). Keep that layout for `import.meta.glob`; see `loadDemoLocales.ts`.
 */
export const demoI18nConfig = {
  /** Must align with the glob in `loadDemoLocales.ts`. */
  globPattern: "./locales/*/*.json" as const,

  /** Allowed language codes; unknown filenames log a dev warning. */
  languages: ["en"] as const,

  /** Deep merge when combining bundles (see `mergeI18nJsonBundles` in appspresso/i18n). */
  mergeDeep: true as const,
} as const;

export type DemoSupportedLocale = (typeof demoI18nConfig.languages)[number];
