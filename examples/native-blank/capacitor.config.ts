import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Minimal Capacitor config — no SQLite, no StatusBar, no extra plugins.
 * Use this app to verify the native shell / WebView / splash pipeline in isolation.
 */
const config: CapacitorConfig = {
  appId: "com.example.appspresso.blank",
  appName: "Native Blank",
  webDir: "dist",
  android: {
    path: "android",
    adjustMarginsForEdgeToEdge: "disable",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
    },
  },
};

export default config;
