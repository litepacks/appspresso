import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export default defineConfig({
  resolve: {
    alias: {
      appspresso: path.join(root, "dist-lib"),
      "appspresso/plugin": path.join(root, "dist-lib/plugin/index.js"),
      "appspresso/auth/plugin-bridge": path.join(
        root,
        "dist-lib/auth/plugin-bridge.js",
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    setupFiles: [path.join(root, "src/test/setup.ts")],
  },
});
