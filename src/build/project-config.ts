import type { CapacitorConfig } from "@capacitor/cli";
import type { UserConfig } from "vite";
import type { AppspressoViteHostConfig } from "@/build/inject-env";
import { createAppspressoViteConfig } from "@/build/vite-config";
import type {
  AppspressoAppMeta,
  AppspressoBackgroundRunnerMeta,
  AppspressoSplashMeta,
  AppspressoSqliteMeta,
  AppspressoStatusBarMeta,
} from "./app-meta";

function splashForCapacitorPlugin(
  splash: AppspressoSplashMeta | undefined,
): Record<string, unknown> | undefined {
  if (splash == null) return undefined;
  const {
    image,
    webPublicPath,
    webAnimation,
    webBootstrapMinDurationMs,
    webExitDurationMs,
    ...rest
  } = splash;
  if (Object.keys(rest).length === 0) return undefined;
  return rest;
}

function backgroundRunnerForCapacitorPlugin(
  runner: AppspressoBackgroundRunnerMeta | undefined,
  appId: string | undefined,
): Record<string, unknown> | undefined {
  if (runner?.enabled !== true) return undefined;
  const label = runner.label ?? (appId ? `${appId}.background` : undefined);
  if (!label) return undefined;
  return {
    label,
    src: runner.src ?? "runners/background.js",
    event: runner.event ?? "appspressoBackgroundTask",
    repeat: runner.repeat ?? false,
    interval: runner.interval ?? 15,
    autoStart: runner.autoStart ?? true,
  };
}

function sqliteForCapacitorPlugin(
  sqlite: AppspressoSqliteMeta | undefined,
): Record<string, unknown> | undefined {
  if (sqlite == null) return undefined;
  const cap: Record<string, unknown> = {};
  if (sqlite.iosDatabaseLocation !== undefined) {
    cap.iosDatabaseLocation = sqlite.iosDatabaseLocation;
  }
  if (sqlite.iosIsEncryption !== undefined) {
    cap.iosIsEncryption = sqlite.iosIsEncryption;
  }
  if (sqlite.androidIsEncryption !== undefined) {
    cap.androidIsEncryption = sqlite.androidIsEncryption;
  }
  return Object.keys(cap).length === 0 ? undefined : cap;
}

function statusBarForCapacitorPlugin(
  statusBar: AppspressoStatusBarMeta | undefined,
): Record<string, unknown> | undefined {
  if (statusBar == null) return undefined;
  const capKeys: Record<string, unknown> = {};
  if (statusBar.style !== undefined) capKeys.style = statusBar.style;
  if (statusBar.backgroundColor !== undefined) {
    capKeys.backgroundColor = statusBar.backgroundColor;
  }
  if (statusBar.overlaysWebView !== undefined) {
    capKeys.overlaysWebView = statusBar.overlaysWebView;
  }
  /** Read by Android MainActivity; Capacitor plugin ignores it. */
  if (statusBar.hidden === true) {
    capKeys._appspressoAndroidImmersive = true;
  }
  return Object.keys(capKeys).length === 0 ? undefined : capKeys;
}

export type AppspressoProjectOptions = {
  /** App name, id, version, icon path, splash, etc. */
  app?: AppspressoAppMeta;
  host?: Partial<AppspressoViteHostConfig>;
  vite?: UserConfig;
  /**
   * Capacitor options. Values here override `app`-derived `appId` / `appName`.
   * `plugins.SplashScreen` merges with `app.splash` (these win on conflict).
   */
  capacitor: CapacitorConfig;
};

/**
 * Single source: Vite default export here; Capacitor object also
 * exported to generate `capacitor.config.json` / align root `capacitor.config.ts`.
 */
export function defineAppspressoProject(options: AppspressoProjectOptions): {
  vite: UserConfig;
  capacitor: CapacitorConfig;
  app: AppspressoAppMeta | undefined;
} {
  const vite = createAppspressoViteConfig({
    host: options.host,
    app: options.app,
    vite: options.vite,
  });

  const fromApp =
    options.app != null
      ? {
          appId: options.app.id,
          appName: options.app.displayName,
        }
      : {};

  const { plugins: userPlugins = {}, ...capRest } = options.capacitor;
  const fromSplash = splashForCapacitorPlugin(options.app?.splash);
  const fromStatusBar = statusBarForCapacitorPlugin(options.app?.statusBar);
  const fromBackgroundRunner = backgroundRunnerForCapacitorPlugin(
    options.app?.backgroundRunner,
    options.app?.id,
  );
  const fromSqlite = sqliteForCapacitorPlugin(options.app?.sqlite);
  const mergedSplashScreen =
    fromSplash || userPlugins.SplashScreen
      ? { ...(fromSplash ?? {}), ...userPlugins.SplashScreen }
      : undefined;

  const mergedStatusBar =
    fromStatusBar || userPlugins.StatusBar
      ? { ...(fromStatusBar ?? {}), ...userPlugins.StatusBar }
      : undefined;

  const mergedBackgroundRunner =
    fromBackgroundRunner || userPlugins.BackgroundRunner
      ? {
          ...(fromBackgroundRunner ?? {}),
          ...userPlugins.BackgroundRunner,
        }
      : undefined;

  const mergedCapacitorSqlite =
    fromSqlite || userPlugins.CapacitorSQLite
      ? { ...(fromSqlite ?? {}), ...userPlugins.CapacitorSQLite }
      : undefined;

  const capacitor: CapacitorConfig = {
    webDir: "dist",
    ...fromApp,
    ...capRest,
    plugins: {
      ...userPlugins,
      ...(mergedSplashScreen ? { SplashScreen: mergedSplashScreen } : {}),
      ...(mergedStatusBar ? { StatusBar: mergedStatusBar } : {}),
      ...(mergedBackgroundRunner
        ? { BackgroundRunner: mergedBackgroundRunner }
        : {}),
      ...(mergedCapacitorSqlite
        ? { CapacitorSQLite: mergedCapacitorSqlite }
        : {}),
    } as CapacitorConfig["plugins"],
  };

  return { vite, capacitor, app: options.app };
}

export type {
  AppspressoAppMeta,
  AppspressoBackgroundRunnerMeta,
  AppspressoOrientationMeta,
  AppspressoSplashMeta,
  AppspressoSqliteMeta,
  AppspressoStatusBarMeta,
  AppspressoThemePalette,
  AppspressoThemePaletteSlots,
} from "./app-meta";
