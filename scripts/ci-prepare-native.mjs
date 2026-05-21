#!/usr/bin/env node
/**
 * CI-native prep: build demo web bundle, emit capacitor config, cap sync, verify copied assets.
 * Usage: node scripts/ci-prepare-native.mjs android|ios
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const platform = process.argv[2];
if (platform !== "android" && platform !== "ios") {
  console.error("usage: node scripts/ci-prepare-native.mjs android|ios");
  process.exit(1);
}

const root = process.cwd();
const demoRoot = join(root, "demo");
const configTs = join(demoRoot, "appspresso.config.ts");

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

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

function findCapCli() {
  let dir = root;
  for (;;) {
    const cap = join(
      dir,
      "node_modules",
      "@capacitor",
      "cli",
      "bin",
      "capacitor",
    );
    if (existsSync(cap)) return cap;
    const parent = join(dir, "..");
    if (parent === dir) return null;
    dir = parent;
  }
}

if (!existsSync(configTs)) {
  fail(`missing ${configTs}`);
}

console.log("==> npm run build:lib");
run("npm", ["run", "build:lib"]);

console.log(`==> npm run build (cwd ${demoRoot})`);
run("npm", ["run", "build"], { cwd: demoRoot });

console.log("==> verify demo/dist");
runNodeScript("verify-native-web-bundle.mjs");

const capJsonPath = join(demoRoot, "capacitor.config.json");

console.log(`==> appspresso cap:config (${demoRoot})`);
run(process.execPath, [join(root, "bin/appspresso.mjs"), "cap:config"], {
  cwd: demoRoot,
});

if (!existsSync(capJsonPath)) {
  fail(`missing ${capJsonPath} after cap:config`);
}

const capConfig = JSON.parse(readFileSync(capJsonPath, "utf8"));
const webDir = capConfig.webDir ?? "dist";
const webAbs = join(demoRoot, webDir);
if (!existsSync(join(webAbs, "index.html"))) {
  fail(
    `capacitor webDir "${webDir}" has no index.html at ${webAbs} (cwd must be demo/)`,
  );
}

const capCli = findCapCli();
if (!capCli) {
  fail("@capacitor/cli not found — run npm ci");
}

console.log(`==> cap sync ${platform} (webDir + native plugins)`);
run(process.execPath, [capCli, "sync", platform], { cwd: demoRoot });

console.log(`==> cap copy ${platform} (force web assets into native tree)`);
run(process.execPath, [capCli, "copy", platform], { cwd: demoRoot });

const pluginsAsset = join(
  demoRoot,
  platform === "android"
    ? "android/app/src/main/assets/capacitor.plugins.json"
    : "ios/App/App/capacitor.plugins.json",
);
if (existsSync(pluginsAsset)) {
  const plugins = JSON.parse(readFileSync(pluginsAsset, "utf8"));
  if (!Array.isArray(plugins) || plugins.length === 0) {
    fail(
      `${pluginsAsset} is empty — add @capacitor/* to demo/package.json and re-run npm ci`,
    );
  }
  console.log(
    `==> ${plugins.length} Capacitor plugins registered for ${platform}`,
  );
} else if (platform === "android") {
  fail(`missing ${pluginsAsset} after cap sync`);
}

if (platform === "android") {
  console.log("==> verify android assets/public");
  runNodeScript("verify-cap-android-public.mjs");
}

console.log(`native web bundle ready for ${platform}`);
