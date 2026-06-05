import type { Screen } from "./types";

export const SCREEN_PATHS: Record<Screen, string> = {
  overview: "/",
  validation: "/validation",
  apply: "/apply",
  routes: "/routes",
  flags: "/flags",
  theme: "/theme",
  env: "/env",
  plugins: "/plugins",
  capacitor: "/capacitor",
  cli: "/cli",
  modules: "/modules",
  sync: "/sync",
  analytics: "/analytics",
};

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen]),
) as Record<string, Screen>;

export function pathToScreen(pathname: string): Screen {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return PATH_TO_SCREEN[normalized] ?? PATH_TO_SCREEN[pathname] ?? "overview";
}

export function screenToPath(screen: Screen): string {
  return SCREEN_PATHS[screen] ?? "/";
}
