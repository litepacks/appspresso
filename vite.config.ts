/// <reference types="vitest/config" />

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { sharedCoverageSettings } from "./vitest.coverage.shared";
import { resolveVitestMaxWorkers } from "./vitest.workers";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as {
  version: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    target: "es2020",
    modulePreload: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Heavy vendor libraries isolated to prevent main bundle bloat
          if (id.includes("framer-motion") || id.includes("motion/react")) {
            return "vendor-motion";
          }
          if (id.includes("@capacitor-community/sqlite")) {
            return "vendor-sqlite";
          }
          if (id.includes("react-i18next") || id.includes("i18next")) {
            return "vendor-i18n";
          }
          if (id.includes("react-router-dom")) {
            return "vendor-router";
          }
          if (id.includes("jotai")) {
            return "vendor-state";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    /** Same shape as `createAppspressoViteConfig`: root template has no `appspresso.config` app meta. */
    __APSPRESSO_APP__: JSON.stringify(JSON.stringify(null)),
  },
  test: {
    testTimeout: 15_000,
    pool: "threads",
    maxWorkers: resolveVitestMaxWorkers(),
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist-lib/**",
      "**/src/test/integration/**",
      /** Run via `npm run test:cli` (Node test runner, not Vitest). */
      "packages/cli-shared/**",
    ],
    coverage: sharedCoverageSettings,
  },
});
