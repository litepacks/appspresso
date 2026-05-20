#!/usr/bin/env node
/**
 * CI-native prep: build demo web bundle, emit capacitor config, cap sync, verify copied assets.
 * Usage: node scripts/ci-prepare-native.mjs android|ios
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const platform = process.argv[2];
if (platform !== "android" && platform !== "ios") {
  console.error("usage: node scripts/ci-prepare-native.mjs android|ios");
  process.exit(1);
}

const root = process.cwd();
const demoRoot = join(root, "demo");
const configTs = join(demoRoot, "appspresso.config.ts");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runNodeScript(rel) {
  run(process.execPath, [join(root, "scripts", rel)]);
}

if (!existsSync(configTs)) {
  console.error(`appspresso: missing ${configTs}`);
  process.exit(1);
}

console.log("==> npm run demo:build");
run("npm", ["run", "demo:build"]);

console.log("==> verify demo/dist");
runNodeScript("verify-native-web-bundle.mjs");

console.log(`==> appspresso cap:config (${demoRoot})`);
run("npm", ["run", "demo:cap-config"]);

const capJson = join(demoRoot, "capacitor.config.json");
if (!existsSync(capJson)) {
  console.error(`appspresso: missing ${capJson} after cap:config`);
  process.exit(1);
}

console.log(`==> appspresso native sync ${platform} --skip-build`);
run("node", [
  join(root, "bin/appspresso.mjs"),
  "native",
  "sync",
  platform,
  "--skip-build",
]);

if (platform === "android") {
  console.log("==> verify android assets/public");
  runNodeScript("verify-cap-android-public.mjs");
}

console.log(`native web bundle ready for ${platform}`);
