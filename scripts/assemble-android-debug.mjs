#!/usr/bin/env node
/**
 * clean + assembleDebug under demo/android, then verify the APK contains the web bundle.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const androidDir = join(root, "demo", "android");
const gradlewName = process.platform === "win32" ? "gradlew.bat" : "gradlew";
const gradleCmd = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const apkGlob = join(
  androidDir,
  "app/build/outputs/apk/debug",
  "app-debug.apk",
);

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

if (!existsSync(join(androidDir, gradlewName))) {
  fail(`missing ${androidDir}/${gradlewName}`);
}

console.log("==> ./gradlew clean assembleDebug");
const g = spawnSync(gradleCmd, ["clean", "assembleDebug"], {
  cwd: androidDir,
  stdio: "inherit",
  shell: false,
});
if (g.status !== 0) process.exit(g.status ?? 1);

if (!existsSync(apkGlob)) {
  fail(`APK not found at ${apkGlob}`);
}

function unzipList(apk) {
  const r = spawnSync("unzip", ["-l", apk], { encoding: "utf8" });
  if (r.status !== 0) fail("unzip -l failed");
  return r.stdout ?? "";
}

const listing = unzipList(apkGlob);
if (!listing.includes("assets/public/index.html")) {
  fail("APK missing assets/public/index.html");
}

/** unzip -l: `  <bytes>  <date>  <time>  <path>` */
const jsEntries = [
  ...listing.matchAll(
    /^\s*(\d+)\s+\S+\s+\S+\s+assets\/public\/assets\/(index-[^/\s]+\.js)\s*$/gm,
  ),
];
if (jsEntries.length === 0) {
  fail("APK missing assets/public/assets/index-*.js entry bundle");
}

const largest = jsEntries.reduce((a, b) =>
  Number(b[1]) > Number(a[1]) ? b : a,
);
const entryBytes = Number(largest[1]);
const entryName = largest[2];
if (entryBytes < 200_000) {
  fail(
    `APK entry bundle too small (${entryBytes} bytes, ${entryName}) — web assets not packaged`,
  );
}

const soFiles = [
  ...listing.matchAll(/^\s*\d+\s+\S+\s+\S+\s+lib\/\S+\.so\s*$/gm),
];
if (soFiles.length < 4) {
  fail(
    `APK has only ${soFiles.length} native .so libraries — run cap sync after adding @capacitor/* to demo/package.json`,
  );
}

const pluginsAsset = join(
  androidDir,
  "app/src/main/assets/capacitor.plugins.json",
);
if (existsSync(pluginsAsset)) {
  const plugins = JSON.parse(readFileSync(pluginsAsset, "utf8"));
  if (!Array.isArray(plugins) || plugins.length === 0) {
    fail(
      "capacitor.plugins.json is empty — native plugins were not registered",
    );
  }
  console.log(`Capacitor plugins in APK: ${plugins.length}`);
}

const apkSize = statSync(apkGlob).size;
const minApk = 12_000_000;
if (apkSize < minApk) {
  fail(
    `APK too small (${apkSize} bytes) for a full Capacitor app — expected native libs + web bundle (>${minApk})`,
  );
}

console.log(
  `APK OK (${Math.round(apkSize / 1024 / 1024)} MiB, bundle ${entryName} ${Math.round(entryBytes / 1024)} KiB, ${soFiles.length} .so)`,
);
