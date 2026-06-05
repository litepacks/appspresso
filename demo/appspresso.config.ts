import { defineAppspressoProject } from "appspresso/build/project-config";

const { vite, capacitor, app } = defineAppspressoProject({
  app: {
    id: "com.example.capacitorvitepoc",
    displayName: "Word practice (demo)",
    version: "0.0.0",
    description:
      "Sample vocabulary app: Jotai, React Router, i18n. Full template lives at the monorepo root (npm run dev).",
    /**
     * Web: favicon / apple-touch in Vite `index.html` (`./icon.svg`).
     * Android / iOS launcher icons need raster assets — at demo root:
     * `npm run cap:assets` (`public/icon.svg` + `public/splash.svg` → `@capacitor/assets`).
     */
    icon: "public/icon.svg",
    /**
     * HSL triples (compatible with `hsl(var(--token))`). If empty, only `appspresso/theme/index.css` defaults apply.
     */
    theme: {
      palette: {
        light: {
          primary: "221 83% 53%",
          primaryForeground: "0 0% 100%",
          ring: "221 83% 53%",
        },
        dark: {
          primary: "217 91% 60%",
          primaryForeground: "222 47% 11%",
          ring: "217 91% 60%",
        },
      },
    },
    splash: {
      launchShowDuration: 3000,
      /**
       * JS handoff via `hideSplashScreen` is preferred; auto-hide is a safety net
       * when the Capacitor bridge stalls on cold start.
       */
      launchAutoHide: true,
      launchFadeOutDuration: 450,
      webBootstrapMinDurationMs: 1000,
      webExitDurationMs: 500,
      /** Same background as `public/splash.svg` — one look for native + web bootstrap. */
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: false,
      /** Public URL served from `demo/public/` — shown on web bootstrap; tune size in `BootstrapLoadingScreen`. */
      webPublicPath: "/splash.svg",
      /** Web bootstrap only: `breathe` / `sway` / `glow` / `pulse` / `float` — see `splash-web-animations`. */
      webAnimation: "breathe",
      /** Document native source; copy into Android drawables / Xcode as part of your asset pipeline. */
      image: "resources/splash.png",
    },
    /**
     * Status bar (Capacitor + `initAppearance`):
     * - `style` / `backgroundColor` → `capacitor.plugins.StatusBar` (after sync in `capacitor.config.json`).
     * - `overlaysWebView` + `hidden` → runtime only (`appearance.service`), injected via `__APSPRESSO_APP__`.
     *
     * Typical combo for a fullscreen feel:
     * - `hidden: true` — hides the system status bar (iOS/Android).
     * - `overlaysWebView: true` — WebView draws under notch / bar; use `AppHeader` / `env(safe-area-inset-top)` in the shell.
     *   On Android, only `hidden: true` + `overlaysWebView: false` on some devices after scrolling
     *   can make the bar reappear; try `overlaysWebView: true` in that case
     *   (`initAppearance` still retries `hide` on app focus / resume).
     *
     * The Android navigation bar is not removed by Capacitor StatusBar; use separate native settings / plugins if needed.
     */
    statusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
      /** Fullscreen: with `hidden: true`, `true` is usually more consistent on Android (bar + scrolling). */
      overlaysWebView: true,
      /** Fullscreen: set `true` and re-run `demo:build` + `cap sync`. */
      hidden: true,
    },
    /** Example: `preferredLock` via `@capacitor/screen-orientation` on native (ignored on web). */
    orientation: {
      preferredLock: "any",
    },
    /** `FilesystemProvider` / `useFilesystem` — `@capacitor/filesystem` peer. */
    filesystem: {
      defaultDirectory: "DATA",
      basePath: "demo",
    },
    /** `@capacitor-community/sqlite` → `capacitor.plugins.CapacitorSQLite`. */
    sqlite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      androidIsEncryption: false,
    },
  },
  host: {
    mount: {
      /** Native WebView: StrictMode double-mount increases heap pressure on low-RAM phones. */
      strictMode: false,
    },
    hostBanner: {
      /** Disabled: title only in `AppTopBar`; removes duplicate top strip. */
      enabled: false,
      body: "English ↔ Turkish cards — add words in demo/src/vocab/seedWords.ts. Full appspresso template: monorepo root npm run dev.",
    },
  },
  /**
   * Capacitor CLI config (single source with `app` above).
   * `defineAppspressoProject` sets `webDir`, `appId`, `appName` and merges plugins:
   * - `app.splash` → `plugins.SplashScreen`
   * - `app.statusBar` → `plugins.StatusBar` (+ `_appspressoAndroidImmersive` when `hidden`)
   * - `app.backgroundRunner` → `plugins.BackgroundRunner`
   * - `app.sqlite` → `plugins.CapacitorSQLite`
   *
   * Emitted JSON (gitignored): `npm run cap:config` or `appspresso native sync` → `capacitor.config.json`.
   */
  capacitor: {
    android: {
      path: "android",
      adjustMarginsForEdgeToEdge: "disable",
    },
    ios: {
      path: "ios",
    },
    /** Extra plugin keys or overrides (`capacitor.plugins.*` wins over `app.*`). */
    plugins: {},
  },
});

export default vite;
export { app, capacitor };
