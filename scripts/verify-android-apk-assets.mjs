#!/usr/bin/env node
/**
 * Fails if debug APK looks like a shell without the synced web bundle.
 * Usage: node scripts/verify-android-apk-assets.mjs [apkGlob]
 */
import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pattern =
  process.argv[2] ??
  join(root, "demo/android/app/build/outputs/apk/debug/*.apk");

/** Debug APK with React bundle is typically tens of MB; ~4MB means assets/public missing. */
const MIN_APK_BYTES = 8_000_000;

let apkPath;
try {
  apkPath = execSync(`ls ${pattern}`, { encoding: "utf8" })
    .trim()
    .split("\n")[0];
} catch {
  console.error(`appspresso: APK not found: ${pattern}`);
  process.exit(1);
}

if (!apkPath || !existsSync(apkPath)) {
  console.error(`appspresso: APK not found: ${pattern}`);
  process.exit(1);
}

const size = statSync(apkPath).size;
if (size < MIN_APK_BYTES) {
  console.error(
    `appspresso: APK too small (${size} bytes) — cap sync likely missed demo/dist.`,
  );
  try {
    console.error(
      execSync(`unzip -l "${apkPath}" | head -40`, { encoding: "utf8" }),
    );
  } catch {
    /* ignore */
  }
  process.exit(1);
}

let hasIndex = false;
try {
  const listing = execSync(`unzip -l "${apkPath}"`, { encoding: "utf8" });
  hasIndex = listing.includes("assets/public/index.html");
} catch {
  /* ignore */
}

if (!hasIndex) {
  console.error("appspresso: APK missing assets/public/index.html");
  process.exit(1);
}

console.log(`APK OK (${Math.round(size / 1024 / 1024)} MiB, ${apkPath})`);
