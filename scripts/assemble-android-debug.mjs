#!/usr/bin/env node
/**
 * clean + assembleDebug under demo/android, then verify the APK contains the web bundle.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
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

console.log("==> verify APK contents");
const verify = spawnSync(
  process.execPath,
  [join(root, "scripts/debug/verify-apk-contents.mjs"), apkGlob],
  { stdio: "inherit", shell: false },
);
if (verify.status !== 0) process.exit(verify.status ?? 1);
