#!/usr/bin/env node
/**
 * Install native-blank debug APK on the first connected adb device.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const apkPath = join(
  process.cwd(),
  "examples/native-blank/android/app/build/outputs/apk/debug/app-debug.apk",
);

if (!existsSync(apkPath)) {
  console.error(`native-blank: APK missing — run npm run ci:native:android:blank`);
  process.exit(1);
}

const list = spawnSync("adb", ["devices"], { encoding: "utf8" });
const serial = list.stdout
  .split("\n")
  .map((l) => l.trim())
  .find((l) => l.endsWith("\tdevice"))
  ?.split("\t")[0];

if (!serial) {
  console.error("native-blank: no adb device attached");
  process.exit(1);
}

console.log(`==> adb install (${serial})`);
const install = spawnSync(
  "adb",
  ["-s", serial, "install", "-r", apkPath],
  { stdio: "inherit" },
);
if (install.status !== 0) process.exit(install.status ?? 1);

const pkg = "com.example.appspresso.blank";
spawnSync("adb", ["-s", serial, "shell", "am", "force-stop", pkg], {
  stdio: "inherit",
});
spawnSync(
  "adb",
  [
    "-s",
    serial,
    "shell",
    "monkey",
    "-p",
    pkg,
    "-c",
    "android.intent.category.LAUNCHER",
    "1",
  ],
  { stdio: "inherit" },
);

console.log(`Launched ${pkg} on ${serial}`);
