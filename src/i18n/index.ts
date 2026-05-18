import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

/** Root of a `.json` file from `import … from "…json"` */
export type I18nJsonRoot = Record<string, unknown>;

/** `language → json root` (e.g. `{ en: enJson, tr: trJson }`) */
export type I18nJsonByLanguage = Record<string, I18nJsonRoot>;

/** `namespace → language → json` — wire host/demo locale folders this way */
export type I18nJsonBundles = Record<string, I18nJsonByLanguage>;

export type MergeI18nJsonOptions = {
  /** i18next `addResourceBundle` deep (default: true) */
  deep?: boolean;
};

/** Output of Vite `import.meta.glob(..., { eager: true, import: "default" })` */
export type ViteGlobJsonModules = Record<string, I18nJsonRoot>;

function readNodeEnvMode(): string | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const proc = (globalThis as Record<string, unknown>).process as
    | { env?: { NODE_ENV?: string } }
    | undefined;
  return proc?.env?.NODE_ENV;
}

function isLikelyDevEnvironment(): boolean {
  const im: unknown =
    typeof import.meta !== "undefined" ? import.meta : undefined;
  if (
    im &&
    typeof im === "object" &&
    "env" in im &&
    (im as { env?: { DEV?: boolean } }).env?.DEV === true
  ) {
    return true;
  }
  const nodeEnv = readNodeEnvMode();
  return typeof nodeEnv === "string" && nodeEnv !== "production";
}

/**
 * Namespace and language from Vite module key per `locales/<namespace>/<language>.json` convention.
 * Pass `resolvePath` in `mergeI18nJsonBundlesFromViteGlob` for custom layouts.
 */
export function parseLocalePathFromViteGlobKey(
  path: string,
): { ns: string; lng: string } | null {
  const normalized = path.replaceAll("\\", "/");
  const m = normalized.match(/(?:^|\/)locales\/([^/]+)\/([^/]+)\.json$/);
  if (!m) return null;
  return { ns: m[1], lng: m[2] };
}

export type MergeI18nFromViteGlobOptions = MergeI18nJsonOptions & {
  /**
   * When set, if language code is not in the list (warning only; bundle is still added)
   * logs to console when `logDevWarnings` is enabled.
   */
  allowedLanguages?: readonly string[];
  /**
   * Warnings for keys that do not match convention / unknown language / duplicate bundle.
   * Default: Vite `import.meta.env.DEV` or `NODE_ENV !== "production"`.
   */
  logDevWarnings?: boolean;
  /** Warning line prefix (e.g. `"[my-app i18n]"`) */
  logPrefix?: string;
  /**
   * Builds `{ ns, lng }` from the file path Vite returns.
   * Uses `parseLocalePathFromViteGlobKey` when omitted.
   */
  resolvePath?: (viteModuleKey: string) => { ns: string; lng: string } | null;
};

/**
 * Splits JSON default exports from Vite `import.meta.glob` by namespace/language and adds them to i18next.
 * The `glob` call must live in the host app (Vite resolves paths).
 * Glob pattern typically includes namespace and language segments under `./locales`; see `parseLocalePathFromViteGlobKey`.
 */
export function mergeI18nJsonBundlesFromViteGlob(
  modules: ViteGlobJsonModules,
  options?: MergeI18nFromViteGlobOptions,
): void {
  const resolver = options?.resolvePath ?? parseLocalePathFromViteGlobKey;
  const allowed = options?.allowedLanguages
    ? new Set(options.allowedLanguages)
    : undefined;
  const log = options?.logDevWarnings !== false && isLikelyDevEnvironment();
  const prefix = options?.logPrefix ?? "[appspresso i18n]";

  const bundles: I18nJsonBundles = {};

  for (const [path, root] of Object.entries(modules)) {
    const parsed = resolver(path);
    if (!parsed) {
      if (log) {
        console.warn(
          `${prefix} Path does not match locales/<ns>/<lng>.json: ${path}`,
        );
      }
      continue;
    }

    const { ns, lng } = parsed;
    if (allowed && !allowed.has(lng) && log) {
      console.warn(
        `${prefix} Language "${lng}" not in allowedLanguages: ${path}`,
      );
    }

    if (bundles[ns] === undefined) {
      bundles[ns] = {};
    }
    const byLang = bundles[ns];
    if (byLang[lng] !== undefined && log) {
      console.warn(
        `${prefix} Duplicate bundle; last wins: namespace=${ns} lang=${lng} (${path})`,
      );
    }
    byLang[lng] = root;
  }

  mergeI18nJsonBundles(bundles, { deep: options?.deep });
}

/**
 * Adds a JSON root to one namespace for one language (Vite/TS: `import x from "./x.json"`).
 */
export function addI18nJsonBundle(
  namespace: string,
  language: string,
  jsonRoot: I18nJsonRoot,
  options?: MergeI18nJsonOptions,
): void {
  const deep = options?.deep ?? true;
  void i18n.addResourceBundle(language, namespace, jsonRoot, deep, true);
}

/**
 * Merges imported JSON for multiple namespaces and languages in one pass.
 *
 * @example
 * import demoEn from "./locales/demo/en.json";
 * import demoTr from "./locales/demo/tr.json";
 * mergeI18nJsonBundles({ demo: { en: demoEn, tr: demoTr } });
 */
export function mergeI18nJsonBundles(
  bundles: I18nJsonBundles,
  options?: MergeI18nJsonOptions,
): void {
  for (const [ns, byLang] of Object.entries(bundles)) {
    for (const [lng, root] of Object.entries(byLang)) {
      addI18nJsonBundle(ns, lng, root, options);
    }
  }
}

export default i18n;
