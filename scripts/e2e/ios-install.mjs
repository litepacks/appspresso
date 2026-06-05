#!/usr/bin/env node
/**
 * Boot simulator, install .app from artifact dir or local build. Prints UDID to stdout.
 * Usage: node scripts/e2e/ios-install.mjs [artifactDir]
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot } from "./paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const artifactDir = process.argv[2] ?? join(repoRoot, "artifacts/ios-app");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (r.status !== 0) {
    if (r.stderr) process.stderr.write(r.stderr);
    process.exit(r.status ?? 1);
  }
  return r;
}

function log(msg) {
  process.stderr.write(`appspresso-e2e: ${msg}\n`);
}

const selectScript = join(__dirname, "select-ios-simulator.mjs");
const simId = run(process.execPath, [selectScript]).stdout.trim();
log(`simulator ${simId}`);

spawnSync("xcrun", ["simctl", "boot", simId], { stdio: "ignore" });

run("xcrun", ["simctl", "bootstatus", simId, "-b"], { stdio: "inherit" });

const resolveScript = join(repoRoot, "scripts/ios-simulator-artifact.mjs");
let appPath;
if (existsSync(artifactDir)) {
  appPath = run(process.execPath, [resolveScript, "resolve", artifactDir]).stdout.trim();
} else {
  appPath = run(process.execPath, [
    join(repoRoot, "scripts/find-ios-simulator-app.mjs"),
    repoRoot,
  ]).stdout.trim();
}

if (!appPath || !existsSync(appPath)) {
  console.error(`appspresso-e2e: App.app not found (dir=${artifactDir})`);
  process.exit(1);
}

log(`install ${appPath}`);
run("xcrun", ["simctl", "install", simId, appPath], { stdio: "inherit" });

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `device_id=${simId}\n`);
}

process.stdout.write(simId);
