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

mergeI18nJsonBundlesFromViteGlob(modules, {
  allowedLanguages: demoI18nConfig.languages,
  deep: demoI18nConfig.mergeDeep,
  logPrefix: "[demo i18n]",
  logDevWarnings: import.meta.env.DEV,
});

setDayjsLocale(i18n.language);
i18n.on("languageChanged", (lng) => {
  setDayjsLocale(lng);
});
