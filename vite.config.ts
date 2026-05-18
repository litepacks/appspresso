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
    ],
    coverage: sharedCoverageSettings,
  },
});
