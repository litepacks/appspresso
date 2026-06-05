import { defineAppspressoTheme } from "appspresso/studio";

export const theme = defineAppspressoTheme({
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
  assets: {
    icon: "public/icon.svg",
    splash: "public/splash.svg",
  },
});
