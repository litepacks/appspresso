/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { integrationCoverageSettings } from "./vitest.integration.coverage.shared";
import { resolveVitestMaxWorkers } from "./vitest.workers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distLib = path.resolve(__dirname, "dist-lib");

/** Run `npm run build:lib` first so `dist-lib` exists. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^appspresso\/template\/(.+)$/,
        replacement: `${distLib}/pages/$1`,
      },
      {
        find: /^appspresso\/(.+)$/,
        replacement: `${distLib}/$1`,
      },
    ],
  },
  define: {
    __APP_VERSION__: JSON.stringify("integration-test"),
  },
  test: {
    name: "integration",
    pool: "threads",
    maxWorkers: resolveVitestMaxWorkers(),
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/integration/setup.ts"],
    include: ["./src/test/integration/**/*.test.{ts,tsx}"],
    fileParallelism: true,
    coverage: integrationCoverageSettings,
  },
});
