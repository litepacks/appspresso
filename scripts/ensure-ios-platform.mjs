/**
 * Ensures demo/ios exists (Capacitor add ios). Safe to run repeatedly.
 * Requires macOS + CocoaPods for first-time `cap add ios`.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const iosApp = join(root, "demo", "ios", "App");

if (existsSync(iosApp)) {
  console.log("ensure-ios-platform: demo/ios already present");
  process.exit(0);
}

console.log("ensure-ios-platform: running npx cap add ios …");
const result = spawnSync("npx", ["cap", "add", "ios"], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
