#!/usr/bin/env node
/**
 * Ensures demo/ios exists (Capacitor add ios). Safe to run repeatedly.
 * Must run from repo root; Capacitor project is demo/.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const demoRoot = join(root, "demo");
const iosApp = join(demoRoot, "ios", "App");

if (existsSync(iosApp)) {
  console.log("ensure-ios-platform: demo/ios already present");
  process.exit(0);
}

console.log("ensure-ios-platform: running npx cap add ios in demo/ …");
const result = spawnSync("npx", ["cap", "add", "ios"], {
  cwd: demoRoot,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
