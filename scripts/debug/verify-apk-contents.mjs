#!/usr/bin/env node
/**
 * Verify a debug APK packages the Capacitor web bundle and native plugins.
 * Usage: node scripts/debug/verify-apk-contents.mjs [path/to/app-debug.apk]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const defaultApk = join(
  root,
  "demo/android/app/build/outputs/apk/debug/app-debug.apk",
);
const apkPath = process.argv[2] ?? defaultApk;

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

if (!existsSync(apkPath)) {
  fail(`APK not found: ${apkPath}`);
}

function unzipList(apk) {
  const r = spawnSync("unzip", ["-l", apk], { encoding: "utf8" });
  if (r.status !== 0) fail("unzip -l failed — install unzip");
  return r.stdout ?? "";
}

function extractIndexHtml(apk) {
  const r = spawnSync("unzip", ["-p", apk, "assets/public/index.html"], {
    encoding: "utf8",
  });
  if (r.status !== 0) return null;
  return r.stdout ?? "";
}

const listing = unzipList(apkPath);

if (!listing.includes("assets/public/index.html")) {
  fail("APK missing assets/public/index.html");
}

const jsEntries = [
  ...listing.matchAll(
    /^\s*(\d+)\s+\S+\s+\S+\s+assets\/public\/assets\/([^/\s]+\.js)\s*$/gm,
  ),
];
if (jsEntries.length === 0) {
  fail("APK missing assets/public/assets/*.js bundles");
}

const indexEntry = jsEntries.find((m) => m[2].startsWith("index-"));
if (!indexEntry) {
  fail("APK missing assets/public/assets/index-*.js entry bundle");
}

const entryBytes = Number(indexEntry[1]);
const entryName = indexEntry[2];
if (entryBytes < 200_000) {
  fail(
    `APK entry bundle too small (${entryBytes} bytes, ${entryName}) — web assets incomplete`,
  );
}

const html = extractIndexHtml(apkPath);
if (!html) {
  fail("could not read assets/public/index.html from APK");
}

const scriptRefs = [
  ...html.matchAll(/src="(\.\/assets\/[^"]+\.js)"/g),
].map((m) => m[1].replace(/^\.\//, "assets/public/"));

const listedJs = new Set(jsEntries.map((m) => `assets/public/assets/${m[2]}`));
const missingChunks = scriptRefs.filter((ref) => !listedJs.has(ref));
if (missingChunks.length > 0) {
  fail(
    `index.html references missing APK chunks: ${missingChunks.join(", ")}`,
  );
}

if (!listing.includes("assets/capacitor.plugins.json")) {
  fail("APK missing assets/capacitor.plugins.json");
}

const pluginsRaw = spawnSync(
  "unzip",
  ["-p", apkPath, "assets/capacitor.plugins.json"],
  { encoding: "utf8" },
);
if (pluginsRaw.status !== 0) {
  fail("could not read assets/capacitor.plugins.json from APK");
}
let pluginCount = 0;
try {
  const plugins = JSON.parse(pluginsRaw.stdout ?? "[]");
  if (!Array.isArray(plugins) || plugins.length === 0) {
    fail("assets/capacitor.plugins.json is empty — run cap sync");
  }
  pluginCount = plugins.length;
} catch {
  fail("assets/capacitor.plugins.json is invalid JSON");
}

const soFiles = [
  ...listing.matchAll(/^\s*\d+\s+\S+\s+\S+\s+lib\/\S+\.so\s*$/gm),
];
if (soFiles.length < 2) {
  fail(
    `APK has only ${soFiles.length} native .so libraries — expected at least libsqlcipher per ABI`,
  );
}

const apkSize = statSync(apkPath).size;
const minApk = 12_000_000;
if (apkSize < minApk) {
  fail(
    `APK too small (${apkSize} bytes) — expected native libs + web bundle (>${minApk})`,
  );
}

console.log(`APK contents OK: ${apkPath}`);
console.log(
  `  size ${Math.round(apkSize / 1024 / 1024)} MiB, entry ${entryName} ${Math.round(entryBytes / 1024)} KiB`,
);
console.log(`  js chunks in APK: ${jsEntries.length}, index.html refs: ${scriptRefs.length}`);
console.log(`  Capacitor plugins: ${pluginCount}`);
console.log(`  native .so libraries: ${soFiles.length}`);
