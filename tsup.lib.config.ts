import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "src");

function addFiles(
  entries: Record<string, string>,
  relDir: string,
  exportPrefix: string,
  ext: string,
) {
  const full = path.join(src, relDir);
  if (!fs.existsSync(full)) return;
  for (const name of fs.readdirSync(full)) {
    if (!name.endsWith(ext)) continue;
    const base = name.slice(0, -ext.length);
    if (base.endsWith(".test")) continue;
    const key = `${exportPrefix}/${base}`;
    entries[key] = path.join("src", relDir, name);
  }
}

function collectEntries(): Record<string, string> {
  const e: Record<string, string> = {};
  addFiles(e, "pages", "pages", ".tsx");
  addFiles(e, "api", "api", ".ts");
  addFiles(e, "config", "config", ".ts");
  addFiles(e, "sync", "sync", ".ts");
  addFiles(e, "db", "db", ".ts");
  addFiles(e, "state", "state", ".ts");
  addFiles(e, "lib", "lib", ".ts");
  addFiles(e, "theme", "theme", ".ts");
  addFiles(e, "permissions", "permissions", ".ts");
  addFiles(e, "deeplink", "deeplink", ".ts");
  addFiles(e, "auth", "auth", ".ts");
  addFiles(e, "auth", "auth", ".tsx");
  addFiles(e, "auth/adapters", "auth/adapters", ".ts");
  addFiles(e, "filesystem", "filesystem", ".ts");
  addFiles(e, "filesystem", "filesystem", ".tsx");
  addFiles(e, "services", "services", ".ts");
  addFiles(e, "hooks", "hooks", ".ts");
  addFiles(e, "motion", "motion", ".tsx");
  addFiles(e, "plugin", "plugin", ".ts");
  addFiles(e, "module", "module", ".ts");
  addFiles(e, "components/ui", "components/ui", ".tsx");
  addFiles(e, "components/form", "components/form", ".tsx");
  addFiles(e, "components/shell", "components/shell", ".tsx");
  const shellBase = path.join(src, "components", "shell", "shell-base.ts");
  if (fs.existsSync(shellBase)) {
    e["components/shell/shell-base"] = path.join(
      "src",
      "components",
      "shell",
      "shell-base.ts",
    );
  }
  const shellIndex = path.join(src, "components", "shell", "index.ts");
  if (fs.existsSync(shellIndex)) {
    e["components/shell/index"] = path.join(
      "src",
      "components",
      "shell",
      "index.ts",
    );
  }
  const loadingFallback = path.join(src, "components", "LoadingFallback.tsx");
  if (fs.existsSync(loadingFallback)) {
    e["components/LoadingFallback"] = path.join(
      "src",
      "components",
      "LoadingFallback.tsx",
    );
  }
  const bottomTabBar = path.join(src, "components", "BottomTabBar.tsx");
  if (fs.existsSync(bottomTabBar)) {
    e["components/BottomTabBar"] = path.join(
      "src",
      "components",
      "BottomTabBar.tsx",
    );
  }
  const authLayout = path.join(src, "components", "AuthLayout.tsx");
  if (fs.existsSync(authLayout)) {
    e["components/AuthLayout"] = path.join(
      "src",
      "components",
      "AuthLayout.tsx",
    );
  }
  const onboardingLayout = path.join(src, "components", "OnboardingLayout.tsx");
  if (fs.existsSync(onboardingLayout)) {
    e["components/OnboardingLayout"] = path.join(
      "src",
      "components",
      "OnboardingLayout.tsx",
    );
  }
  const layout = path.join(src, "components", "Layout.tsx");
  if (fs.existsSync(layout)) {
    e["components/Layout"] = path.join("src", "components", "Layout.tsx");
  }
  const errorBoundary = path.join(src, "components", "ErrorBoundary.tsx");
  if (fs.existsSync(errorBoundary)) {
    e["components/ErrorBoundary"] = path.join(
      "src",
      "components",
      "ErrorBoundary.tsx",
    );
  }
  const outletErrorBoundary = path.join(
    src,
    "components",
    "OutletErrorBoundary.tsx",
  );
  if (fs.existsSync(outletErrorBoundary)) {
    e["components/OutletErrorBoundary"] = path.join(
      "src",
      "components",
      "OutletErrorBoundary.tsx",
    );
  }
  addFiles(e, "app/providers", "app/providers", ".tsx");
  const fsIndex = path.join(src, "filesystem", "index.ts");
  if (fs.existsSync(fsIndex)) {
    e["filesystem/index"] = path.join("src", "filesystem", "index.ts");
  }
  addFiles(e, "dev", "dev", ".ts");
  addFiles(e, "dev", "dev", ".tsx");
  for (const name of [
    "events.ts",
    "bootstrap.ts",
    "GlobalErrorListeners.tsx",
    "BootstrapLoadingScreen.tsx",
    "AppspressoBootstrapGate.tsx",
    "RootProviders.tsx",
    "AppLifecycleSync.tsx",
    "RouteSync.tsx",
    "DeepLinkSync.tsx",
    "RootShell.tsx",
    "onboarding.config.ts",
    "OnboardingGate.tsx",
    "OnboardingEntry.tsx",
    "AuthEntry.tsx",
    "HostAppFrame.tsx",
    "AppspressoHost.tsx",
    "App.tsx",
    "mount-host.tsx",
    "mount.tsx",
    "router.tsx",
    "route-tree.ts",
  ]) {
    const p = path.join(src, "app", name);
    if (fs.existsSync(p)) {
      const base = path.basename(name, path.extname(name));
      e[`app/${base}`] = path.join("src", "app", name);
    }
  }
  return {
    ...e,
    "components/form/index": path.join("src", "components", "form", "index.ts"),
    motion: path.join("src", "motion", "index.ts"),
    i18n: path.join("src", "i18n", "index.ts"),
    "build/tailwind-preset": path.join("src", "build", "tailwind-preset.ts"),
    "build/app-meta": path.join("src", "build", "app-meta.ts"),
    "build/inject-env": path.join("src", "build", "inject-env.ts"),
    "build/vite-config": path.join("src", "build", "vite-config.ts"),
    "build/project-config": path.join("src", "build", "project-config.ts"),
    "build/app-meta.schema": path.join("src", "build", "app-meta.schema.ts"),
    studio: path.join("src", "studio", "index.ts"),
    "build/injected-app-meta": path.join(
      "src",
      "build",
      "injected-app-meta.ts",
    ),
    "build/injected-runtime": path.join("src", "build", "injected-runtime.ts"),
  };
}

const external = [
  /^react$/,
  /^react\//,
  /^react-dom/,
  "react-router",
  "react-router-dom",
  /^react-router/,
  /^@tanstack\//,
  "jotai",
  "axios",
  "dayjs",
  /^dayjs\//,
  "i18next",
  "react-i18next",
  /^@capacitor\//,
  "@capacitor/cli",
  "@heroicons/react",
  /^@heroicons\/react\//,
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "tailwindcss-animate",
  "sonner",
  "zod",
  "vite",
  "@vitejs/plugin-react",
  "tailwindcss",
  "autoprefixer",
  "@revenuecat/purchases-capacitor",
  "@capacitor-community/sqlite",
  "@aparajita/capacitor-secure-storage",
  /^@radix-ui\//,
  "@hookform/resolvers",
  "react-hook-form",
  "motion",
  /^motion\//,
  "imask",
  /^imask\//,
  "react-imask",
  "firebase/auth",
  "firebase/app",
  "@supabase/supabase-js",
  /^@appspresso\/plugin-/,
  "@capacitor/background-runner",
  "@capacitor/filesystem",
  "@capacitor/inappbrowser",
  "@capacitor/share",
];

/** Native/demo iteration: JS only (~3–4s). Publish/CI types: full build:lib (~60s DTS). */
const skipDts = process.env.APPSPRESSO_SKIP_DTS === "1";

export default defineConfig({
  tsconfig: skipDts ? "tsconfig.app.json" : "tsconfig.lib-dts.json",
  entry: collectEntries(),
  format: ["esm"],
  outDir: "dist-lib",
  splitting: true,
  sourcemap: process.env.CI !== "true",
  clean: true,
  treeshake: true,
  dts: !skipDts,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
  },
  esbuildOptions(opts) {
    opts.alias = { "@": path.join(__dirname, "src") };
  },
  external,
  async onSuccess() {
    const themeDir = path.join(__dirname, "dist-lib", "theme");
    fs.mkdirSync(themeDir, { recursive: true });
    fs.copyFileSync(
      path.join(__dirname, "src", "index.css"),
      path.join(themeDir, "index.css"),
    );
  },
});
