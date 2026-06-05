#!/usr/bin/env node
/**
 * Install debug APK, launch the app, and stream filtered logcat for splash/bootstrap issues.
 *
 * Usage:
 *   node scripts/debug/android-logcat.mjs [--skip-install] [--apk path]
 *
 * Requires: adb on PATH, device/emulator connected.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaultAndroidApk } from "../e2e/paths.mjs";
import { resolveAndroidTools } from "../e2e/android-sdk.mjs";

const APP_ID = "com.example.capacitorvitepoc";
const MAIN_ACTIVITY = `${APP_ID}/.MainActivity`;

const args = process.argv.slice(2);
let skipInstall = false;
let apkPath = defaultAndroidApk;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skip-install") skipInstall = true;
  else if (args[i] === "--apk" && args[i + 1]) {
    apkPath = args[++i];
  }
}

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

const tools = resolveAndroidTools();
if (!tools?.adb) {
  fail("adb not found — set ANDROID_HOME or install Android platform-tools");
}
const adb = tools.adb;

function runAdb(adbcArgs, opts = {}) {
  const r = spawnSync(adb, adbcArgs, {
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.status !== 0 && !opts.allowFail) {
    process.exit(r.status ?? 1);
  }
  return r;
}

console.log("==> waiting for device");
runAdb(["wait-for-device"]);

if (!skipInstall) {
  if (!existsSync(apkPath)) {
    fail(`APK missing: ${apkPath} — run npm run ci:native:android first`);
  }
  console.log(`==> installing ${apkPath}`);
  runAdb(["install", "-r", apkPath]);
}

console.log("==> clearing logcat buffer");
runAdb(["logcat", "-c"]);

console.log(`==> launching ${MAIN_ACTIVITY}`);
runAdb([
  "shell",
  "am",
  "start",
  "-n",
  MAIN_ACTIVITY,
  "-a",
  "android.intent.action.MAIN",
  "-c",
  "android.intent.category.LAUNCHER",
]);

console.log("Streaming logcat (Ctrl+C to stop).");
console.log("Bootstrap timeline filter: APSPRESSO_BOOT");
console.log("  adb logcat | grep APSPRESSO_BOOT");
console.log("");
console.log("Splash layers:");
console.log("  - No change after ~4s: JS may not boot (check chromium/Console errors below)");
console.log("  - Native splash hides but Loading persists: bootstrap hang");
console.log("");

const filter = spawn(adb, ["logcat"], { stdio: ["ignore", "pipe", "inherit"] });
const pattern =
  /APSPRESSO_BOOT|capacitor|chromium|Console|AndroidRuntime|appspresso|bootstrap|WebView|FATAL|V8 javascript OOM|Renderer process|tile memory/i;

filter.stdout.on("data", (chunk) => {
  const lines = chunk.toString().split("\n");
  for (const line of lines) {
    if (pattern.test(line)) process.stdout.write(`${line}\n`);
  }
});

filter.on("close", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => {
  filter.kill("SIGINT");
});
