#!/usr/bin/env node
/**
 * Wait for adb device, install APK. Usage: node scripts/e2e/android-install.mjs [apkPath|apkDir]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolveAndroidTools } from "./android-sdk.mjs";
import { defaultAndroidApk } from "./paths.mjs";

const tools = resolveAndroidTools();
if (!tools) {
  console.error(
    "appspresso-e2e: Android SDK not found (set ANDROID_HOME or install Android Studio).",
  );
  process.exit(1);
}
const adb = tools.adb;

function run(args) {
  const r = spawnSync(adb, args, { stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function shellAdb(shellArgs) {
  const r = spawnSync(adb, ["shell", shellArgs], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function resolveApk(arg) {
  if (!arg) {
    if (!existsSync(defaultAndroidApk)) {
      console.error(`appspresso-e2e: APK not found at ${defaultAndroidApk}`);
      process.exit(1);
    }
    return defaultAndroidApk;
  }
  if (arg.endsWith(".apk") && existsSync(arg)) return arg;
  if (existsSync(arg)) {
    const files = readdirSync(arg).filter((f) => f.endsWith(".apk"));
    if (files.length === 0) {
      console.error(`appspresso-e2e: no APK in ${arg}`);
      process.exit(1);
    }
    return join(arg, files[0]);
  }
  console.error(`appspresso-e2e: APK path not found: ${arg}`);
  process.exit(1);
}

const apk = resolveApk(process.argv[2]);

run(["wait-for-device"]);
shellAdb(
  'while [ "$(getprop sys.boot_completed 2>/dev/null)" != "1" ]; do sleep 2; done',
);
// bootanim property is empty on some API 36 images — boot_completed is enough.
spawnSync(adb, ["shell", "wm", "dismiss-keyguard"], { stdio: "inherit" });

const install = spawnSync(adb, ["install", "-r", apk], {
  stdio: "inherit",
  shell: false,
});
if (install.status !== 0) {
  spawnSync(adb, ["logcat", "-d", "-t", "200"], { stdio: "inherit" });
  process.exit(install.status ?? 1);
}

process.stderr.write(`appspresso-e2e: installed ${apk}\n`);
