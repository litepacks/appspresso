#!/usr/bin/env node
/**
 * Build examples/native-blank web bundle, ensure Android platform, cap sync.
 * Usage: node scripts/ci-prepare-native-blank.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appRoot = join(root, "examples", "native-blank");
const androidDir = join(appRoot, "android");

function fail(msg) {
  console.error(`native-blank: ${msg}`);
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

if (!existsSync(join(appRoot, "package.json"))) {
  fail("missing examples/native-blank/package.json");
}

console.log("==> npm install (workspace root, links native-blank deps)");
run("npm", ["install"], { cwd: root });

console.log(`==> npm run build (${appRoot})`);
run("npm", ["run", "build"], { cwd: appRoot });

if (!existsSync(join(appRoot, "dist", "index.html"))) {
  fail("dist/index.html missing after vite build");
}

const capCli = findCapCli();
if (!capCli) fail("@capacitor/cli not found — run npm install");

if (!existsSync(join(androidDir, "gradlew"))) {
  console.log("==> cap add android (first-time platform scaffold)");
  run(process.execPath, [capCli, "add", "android"], { cwd: appRoot });
}

console.log("==> cap sync android");
run(process.execPath, [capCli, "sync", "android"], { cwd: appRoot });

console.log("==> cap copy android");
run(process.execPath, [capCli, "copy", "android"], { cwd: appRoot });

const pluginsAsset = join(
  appRoot,
  "android/app/src/main/assets/capacitor.plugins.json",
);
if (!existsSync(pluginsAsset)) {
  fail(`missing ${pluginsAsset} after cap sync`);
}

console.log("native-blank web bundle ready for android");
