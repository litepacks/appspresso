import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import type { Config as TailwindConfig } from "tailwindcss";
import tailwindcss from "tailwindcss";
import { defineConfig, mergeConfig, type Plugin, type UserConfig } from "vite";
import type { AppspressoAppMeta } from "./app-meta";
import type { AppspressoViteHostConfig } from "./inject-env";
import { appspressoTailwindPreset } from "./tailwind-preset";

export type { AppspressoViteHostConfig } from "./inject-env";
export { parseViteDoubleJson } from "./inject-env";

/** Default Tailwind `content` globs (monorepo `dist-lib` + published `appspresso` package). */
export const appspressoTailwindContent = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "../dist-lib/**/*.js",
  "./node_modules/appspresso/dist-lib/**/*.js",
] as const;

const defaultHost: AppspressoViteHostConfig = {
  mount: {
    rootElementId: "root",
    strictMode: true,
  },
};

function resolveHost(
  partial?: Partial<AppspressoViteHostConfig>,
  app?: AppspressoAppMeta,
): AppspressoViteHostConfig {
  const withTitle =
    partial?.hostBanner != null && app != null
      ? {
          ...partial,
          hostBanner: {
            ...partial.hostBanner,
            title: partial.hostBanner.title ?? app.displayName,
          },
        }
      : partial;
  return {
    mount: {
      rootElementId:
        withTitle?.mount?.rootElementId ?? defaultHost.mount.rootElementId,
      strictMode: withTitle?.mount?.strictMode ?? defaultHost.mount.strictMode,
    },
    ...(withTitle?.hostBanner !== undefined
      ? { hostBanner: withTitle.hostBanner }
      : {}),
  };
}

/**
 * When `app.icon` path starts with `public/`, `<link>` lines for `index.html`.
 * Produces relative `href` (`./icon.svg`) compatible with `base: "./"`.
 */
export function faviconLinkTagsFromAppIcon(
  icon: string | undefined,
): string | null {
  if (icon == null || !icon.startsWith("public/")) return null;
  const href = `./${icon.slice("public/".length)}`;
  const typeAttr = href.endsWith(".svg") ? ' type="image/svg+xml"' : "";
  return `    <link rel="icon" href="${href}"${typeAttr} />\n    <link rel="apple-touch-icon" href="${href}" />\n`;
}

/**
 * Vite + PostCSS + Tailwind defaults for a host `appspresso.config.ts`.
 * - `__APSPRESSO_HOST__` — parse with `parseViteDoubleJson` from `appspresso/build/inject-env` in `main.tsx` (not this module — it pulls Tailwind into the client).
 * - `__APSPRESSO_APP__` — same; `null` when no `app` meta. `ThemeProvider` applies `theme.palette` at runtime when present.
 * Host banner `title` falls back to `app.displayName` when `app` is set.
 */
export function createAppspressoViteConfig(options?: {
  host?: Partial<AppspressoViteHostConfig>;
  app?: AppspressoAppMeta;
  vite?: UserConfig;
}): UserConfig {
  const host = resolveHost(options?.host, options?.app);

  const tailwind: TailwindConfig = {
    content: [...appspressoTailwindContent],
    presets: [appspressoTailwindPreset],
  };

  const define: Record<string, string> = {
    __APSPRESSO_HOST__: JSON.stringify(JSON.stringify(host)),
    __APSPRESSO_APP__: JSON.stringify(JSON.stringify(options?.app ?? null)),
  };

  const faviconTags = faviconLinkTagsFromAppIcon(options?.app?.icon);

  const base = defineConfig({
    define,
    plugins: [
      react(),
      ...(faviconTags
        ? [
            {
              name: "appspresso-app-icon",
              transformIndexHtml(html: string) {
                if (/rel=["']icon["']/i.test(html)) return html;
                return html.replace(/<\/head>/i, `${faviconTags}</head>`);
              },
            } satisfies Plugin,
          ]
        : []),
    ],
    base: "./",
    build: {
      outDir: "dist",
      /** Capacitor Android System WebView versions lag; avoid shipping syntax they cannot parse. */
      target: "es2020",
    },
    css: {
      postcss: {
        plugins: [tailwindcss(tailwind), autoprefixer()],
      },
    },
  });

  return options?.vite ? mergeConfig(base, options.vite) : base;
}
