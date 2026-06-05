import i18n, {
  type I18nJsonRoot,
  mergeI18nJsonBundlesFromViteGlob,
} from "appspresso/i18n";
import { setDayjsLocale } from "appspresso/lib/dayjs";
import { demoI18nConfig } from "./i18n.config";

/** Vite requires a static glob string — keep it in sync with `demoI18nConfig.globPattern`. */
const modules = import.meta.glob<I18nJsonRoot>("./locales/*/*.json", {
  eager: true,
  import: "default",
});

const mergeOptions = {
  allowedLanguages: demoI18nConfig.languages,
  deep: demoI18nConfig.mergeDeep,
  logPrefix: "[demo i18n]",
  logDevWarnings: import.meta.env.DEV,
} as const;

/**
 * Registers `locales/demo/*.json` on the shared i18next instance.
 * Call again after lazy chunks that re-run `@/i18n` init (wipes extra namespaces).
 */
export function applyDemoLocales(): void {
  mergeI18nJsonBundlesFromViteGlob(modules, mergeOptions);
  setDayjsLocale(i18n.language);
}

applyDemoLocales();

i18n.on("languageChanged", (lng) => {
  setDayjsLocale(lng);
});

// If a lazy import re-inits i18next, merge demo bundles again.
i18n.on("initialized", () => {
  applyDemoLocales();
});
