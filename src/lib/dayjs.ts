import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/tr";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

const supportedLocales = new Set(["en", "tr"]);

/**
 * Maps i18next language code (e.g. `tr`, `tr-TR`, `en-US`) to preloaded dayjs locale key.
 * Falls back to `en`; import `dayjs/locale/<code>` and
 * use `registerDayjsLocale` for more locales.
 */
export function resolveDayjsLocale(i18nLanguage: string): string {
  const raw = i18nLanguage.trim().toLowerCase().replaceAll("_", "-");
  if (!raw) return "en";
  const [base, region] = raw.split("-");
  const candidates = region ? [`${base}-${region}`, base] : [base];
  for (const c of candidates) {
    if (c && supportedLocales.has(c)) return c;
  }
  if (base && supportedLocales.has(base)) return base;
  return "en";
}

export function setDayjsLocale(i18nLanguage: string): void {
  dayjs.locale(resolveDayjsLocale(i18nLanguage));
}

/** Call after importing extra `dayjs/locale/*` in template or app. */
export function registerDayjsLocale(localeKey: string): void {
  supportedLocales.add(localeKey.toLowerCase());
}

export { dayjs };
