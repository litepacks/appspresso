import { defineAppspressoProject } from "appspresso/build/project-config";
import { theme } from "./appspresso.theme";

const { vite, capacitor, app } = defineAppspressoProject({
  app: {
    id: "%%APP_ID%%",
    displayName: "%%DISPLAY_NAME%%",
    version: "%%VERSION%%",
    icon: theme.assets.icon,
    theme: { palette: theme.palette },
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
export { app, capacitor };
