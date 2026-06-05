#!/usr/bin/env node
/**
 * Local + CI Maestro E2E entrypoint.
 *
 *   node scripts/e2e/run.mjs list|smoke|android|ios|all [--skip-build]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureAndroidEmulator } from "./emulator.mjs";
import {
  defaultAndroidApk,
  flowsAndroid,
  flowsIos,
  flowsShared,
  repoRoot,
} from "./paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cmd = process.argv[2];
const skipBuild = process.argv.includes("--skip-build");

function runNode(script, args = []) {
  const r = spawnSync(process.execPath, [join(__dirname, script), ...args], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runNpm(script) {
  const r = spawnSync("npm", ["run", script], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function listFlows(dir, label) {
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  for (const f of files.sort()) {
    console.log(`${label}/${f}`);
  }
}

function cmdList() {
  console.log("Maestro flows:");
  listFlows(flowsShared, "shared");
  listFlows(flowsAndroid, "android");
  listFlows(flowsIos, "ios");
  console.log("\nCommands:");
  console.log("  npm run e2e:android");
  console.log("  npm run e2e:ios");
  console.log("  npm run e2e:smoke");
  console.log("  npm run e2e");
}

async function cmdAndroid({ smokeOnly = false } = {}) {
  if (!skipBuild) {
    runNpm("ci:native:android");
  } else if (!existsSync(defaultAndroidApk)) {
    console.error(
      `appspresso-e2e: --skip-build but APK missing at ${defaultAndroidApk}`,
    );
    process.exit(1);
  }

  await ensureAndroidEmulator();
  runNode("android-install.mjs");
  const flowArg = smokeOnly
    ? ["--flow", join(flowsShared, "smoke.yaml")]
    : [];
  runNode("maestro.mjs", ["--platform", "android", ...flowArg]);
}

async function cmdIos({ smokeOnly = false } = {}) {
  if (process.platform !== "darwin") {
    console.error("appspresso-e2e: iOS E2E requires macOS");
    process.exit(1);
  }

  if (!skipBuild) {
    runNpm("ci:native:ios");
  }

  const install = spawnSync(
    process.execPath,
    [join(__dirname, "ios-install.mjs")],
    { cwd: repoRoot, encoding: "utf8" },
  );
  if (install.status !== 0) process.exit(install.status ?? 1);
  const deviceId = (install.stdout || "").trim();

  const flowArgs = smokeOnly
    ? ["--flow", join(flowsShared, "smoke.yaml")]
    : [];
  runNode("maestro.mjs", [
    "--platform",
    "ios",
    "--device",
    deviceId,
    ...flowArgs,
  ]);
}

async function main() {
  switch (cmd) {
    case "list":
      cmdList();
      break;
    case "smoke":
      if (process.platform === "darwin") {
        await cmdIos({ smokeOnly: true });
      } else {
        await cmdAndroid({ smokeOnly: true });
      }
      break;
    case "android":
      await cmdAndroid();
      break;
    case "ios":
      await cmdIos();
      break;
    case "all": {
      await cmdAndroid();
      if (process.platform === "darwin") {
        await cmdIos();
      } else {
        process.stderr.write(
          "appspresso-e2e: skipping iOS on non-macOS host\n",
        );
      }
      break;
    }
    default:
      console.error(
        "usage: node scripts/e2e/run.mjs list|smoke|android|ios|all [--skip-build]",
      );
      process.exit(1);
  }
}

main();
