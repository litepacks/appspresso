import type { CapacitorConfig } from "@capacitor/cli";

/** Keep splash background in sync with src/config/constants.ts SPLASH_BACKGROUND_LIGHT */
const config: CapacitorConfig = {
  appId: "com.example.capacitorvitepoc",
  appName: "Appspresso",
  /** Showcase APK uses `npm run demo:build` → `demo/dist`. Root `dist` is the monorepo template build. */
  webDir: "demo/dist",
  android: {
    path: "demo/android",
    /** Reduces clash between embedded scrolling and immersive status bar. */
    adjustMarginsForEdgeToEdge: "disable",
  },
  ios: {
    path: "demo/ios",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
      overlaysWebView: true,
      /** Android MainActivity re-applies WindowInsets hide when this flag is set (see project-config statusBar.hidden). */
      _appspressoAndroidImmersive: true,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      androidIsEncryption: false,
    },
  },
};

export default config;
