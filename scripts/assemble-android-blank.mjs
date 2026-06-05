#!/usr/bin/env node
/**
 * assembleDebug for examples/native-blank/android
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const androidDir = join(root, "examples", "native-blank", "android");
const gradlewName = process.platform === "win32" ? "gradlew.bat" : "gradlew";
const gradleCmd = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const apkPath = join(
  androidDir,
  "app/build/outputs/apk/debug/app-debug.apk",
);

function fail(msg) {
  console.error(`native-blank: ${msg}`);
  process.exit(1);
}

if (!existsSync(join(androidDir, gradlewName))) {
  fail(`missing ${androidDir}/${gradlewName} — run ci-prepare-native-blank first`);
}

console.log("==> ./gradlew clean assembleDebug (native-blank)");
const g = spawnSync(gradleCmd, ["clean", "assembleDebug"], {
  cwd: androidDir,
  stdio: "inherit",
  shell: false,
});
if (g.status !== 0) process.exit(g.status ?? 1);

if (!existsSync(apkPath)) {
  fail(`APK not found at ${apkPath}`);
}

console.log(`APK: ${apkPath}`);
