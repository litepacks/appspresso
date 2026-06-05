import { defineAppspressoProject } from "appspresso/build/project-config";

const { vite } = defineAppspressoProject({
  app: {
    id: "com.example.todooffline",
    displayName: "Todo offline",
    version: "%%VERSION%%",
    icon: "public/icon.svg",
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
      backgroundColor: "#0f172a",
      webBootstrapMinDurationMs: 600,
      webExitDurationMs: 400,
      webPublicPath: "/splash.svg",
      webAnimation: "none",
    },
  },
  capacitor: {
    webDir: "dist",
    android: { path: "android" },
    ios: { path: "ios" },
  },
});

export default vite;
