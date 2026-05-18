/**
 * Single source for host app identity in `appspresso.config.ts`.
 * `defineAppspressoProject` maps these to Capacitor (`appId`, `appName`) and can
 * inject them at build time via Vite as `__APSPRESSO_APP__`.
 */

/** Fields passed through to Capacitor `plugins.SplashScreen` (plus host-only keys below). */
export type AppspressoSplashMeta = {
  /**
   * Source asset path relative to the app root (e.g. `resources/splash.png`).
   * Not copied automatically — use Capacitor asset tooling or copy into
   * `android/.../drawable*` / Xcode assets. Documents the canonical file.
   */
  image?: string;
  /**
   * Web bootstrap (`BootstrapLoadingScreen`): URL under Vite `public/` (e.g. `/splash.svg`).
   */
  webPublicPath?: string;
  /**
   * Web bootstrap only: motion for graphics shown in `BootstrapLoadingScreen`.
   * Native splash stays a raster; use a fullscreen screen after WebView opens for real video/Lottie.
   */
  webAnimation?: "none" | "pulse" | "float" | "breathe" | "sway" | "glow";
  /** Minimum time the web bootstrap screen stays visible (ms). */
  webBootstrapMinDurationMs?: number;
  /** Exit animation when transitioning from bootstrap to the main app (ms). */
  webExitDurationMs?: number;
  launchShowDuration?: number;
  launchAutoHide?: boolean;
  launchFadeOutDuration?: number;
  backgroundColor?: string;
  androidSplashResourceName?: string;
  androidScaleType?: string;
  showSpinner?: boolean;
  androidSpinnerStyle?: string;
  iosSpinnerStyle?: "small" | "large";
  spinnerColor?: string;
  splashFullScreen?: boolean;
  splashImmersive?: boolean;
  layoutName?: string;
  useDialog?: boolean;
};

/**
 * Native status bar: merges into `capacitor.plugins.StatusBar` (`style`, `backgroundColor`)
 * and is applied at runtime in `initAppearance` (`overlaysWebView`, `hidden`).
 */
export type AppspressoStatusBarMeta = {
  /** Capacitor: `LIGHT` (dark icons on light bar) or `DARK` (light icons). */
  style?: "LIGHT" | "DARK";
  /** Android: bar background (iOS mainly uses style). */
  backgroundColor?: string;
  /**
   * When true, content draws under the status bar (edge-to-edge). When false, WebView is inset below the bar.
   * Applied via `StatusBar.setOverlaysWebView`.
   */
  overlaysWebView?: boolean;
  /** When true, calls `StatusBar.hide()` after other bar setup. `ThemeProvider` does not re-show it. */
  hidden?: boolean;
};

/**
 * Aligns with the local component and optional `@capacitor/screen-orientation`.
 * When `preferredLock !== "any"`, `ScreenOrientation.lock` may be called at app startup.
 */
/**
 * `@capacitor/background-runner` — merges into `capacitor.plugins.BackgroundRunner`.
 * `src` is relative to the web root (e.g. `public/runners/background.js` → `runners/background.js`).
 * iOS/Android native setup: Capacitor Background Runner docs (Background Modes, AppDelegate, gradle).
 */
/** `@capacitor-community/sqlite` — merges into `capacitor.plugins.CapacitorSQLite`. */
export type AppspressoSqliteMeta = {
  iosDatabaseLocation?: string;
  iosIsEncryption?: boolean;
  androidIsEncryption?: boolean;
};

export type AppspressoFilesystemMeta = {
  /** Capacitor `Directory.*` key — e.g. `"DATA"`, `"DOCUMENTS"`. */
  defaultDirectory?:
    | "DOCUMENTS"
    | "DATA"
    | "LIBRARY"
    | "CACHE"
    | "EXTERNAL"
    | "EXTERNAL_STORAGE"
    | "TEMPORARY";
  /** Prepended to all relative paths. */
  basePath?: string;
};

export type AppspressoBackgroundRunnerMeta = {
  /** `false` or undefined: no plugin config is emitted. */
  enabled?: boolean;
  /** OS logs / BGTaskScheduler (iOS) — usually a unique string derived from `appId`. */
  label?: string;
  /** Runner JS file, relative to bundle root (e.g. `runners/background.js`). */
  src?: string;
  /** OS background task or event name triggered via `dispatchEvent`. */
  event?: string;
  repeat?: boolean;
  /** Minutes; interval when used with `repeat`. */
  interval?: number;
  /** Register and schedule the task when the app loads (plugin default: true). */
  autoStart?: boolean;
};

export type AppspressoOrientationMeta = {
  /**
   * Default screen lock target. Native requires `@capacitor/screen-orientation`; the core package does not install the plugin.
   * Ignored on web.
   */
  preferredLock?:
    | "any"
    | "portrait"
    | "landscape"
    | "portrait-primary"
    | "landscape-primary";
};

/**
 * From `defineAppspressoProject({ app: { theme: { palette: … }}})`;
 * values must be `"H S% L"` for `hsl(var(--token))`.
 */
export type AppspressoThemePaletteSlots = {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
};

export type AppspressoThemePalette = {
  light?: AppspressoThemePaletteSlots;
  dark?: AppspressoThemePaletteSlots;
};

export type AppspressoAppMeta = {
  /** Capacitor `appName` and default host banner title. */
  displayName: string;
  /** Capacitor `appId` (reverse-DNS, e.g. com.company.app). */
  id: string;
  /** Semantic version (often aligned with package.json). */
  version?: string;
  /** Short summary for store listings / docs / PWA manifests. */
  description?: string;
  /**
   * Primary icon: preferably under `public/` (Vite serves it directly). Relative path from project root.
   * Values like `public/icon.svg` add favicon / apple-touch links to `index.html`.
   * For native launcher generation, point `@capacitor/assets` or IDE assets at the same file or a PNG copy.
   */
  icon?: string;
  /** Splash screen: merges into Capacitor SplashScreen plugin + optional web image. */
  splash?: AppspressoSplashMeta;
  /** Status bar: Capacitor plugin merge + runtime overlays / visibility. */
  statusBar?: AppspressoStatusBarMeta;
  /**
   * Optional screen orientation lock (native + `@capacitor/screen-orientation`).
   * `useOrientation` and package `orientation.portraitMaxAspectRatio` are detection-only.
   */
  orientation?: AppspressoOrientationMeta;
  /** Capacitor Background Runner (native; not on web). */
  backgroundRunner?: AppspressoBackgroundRunnerMeta;
  /** `FilesystemProvider` defaults (`useFilesystem`). */
  filesystem?: AppspressoFilesystemMeta;
  /** Offline DB / sync scaffold (`@capacitor-community/sqlite`). */
  sqlite?: AppspressoSqliteMeta;
  /**
   * Optional color tokens; `ThemeProvider` reads them from `__APSPRESSO_APP__` and writes CSS variables.
   * Base styles live in `appspresso/theme/index.css`.
   */
  theme?: {
    palette?: AppspressoThemePalette;
  };
};
