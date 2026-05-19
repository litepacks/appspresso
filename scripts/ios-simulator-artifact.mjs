#!/usr/bin/env node
/**
 * Package / resolve iOS Simulator .app for CI artifacts.
 *
 *   node scripts/ios-simulator-artifact.mjs package [repoRoot]
 *   node scripts/ios-simulator-artifact.mjs resolve <artifactDir>
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(__dirname, "..");

/**
 * @param {string} dir
 * @param {number} depth
 * @returns {string | null}
 */
function findAppBundle(dir, depth = 0) {
  if (depth > 12 || !existsSync(dir)) return null;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (name.endsWith(".app") && st.isDirectory() && !name.endsWith(".dSYM")) {
      return full;
    }
    if (st.isDirectory() && name !== "node_modules") {
      const nested = findAppBundle(full, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * @param {string} searchRoot
 * @returns {string | null}
 */
function resolveAppInTree(searchRoot) {
  const named = join(
    searchRoot,
    "Build",
    "Products",
    "Debug-iphonesimulator",
    "App.app",
  );
  if (existsSync(named)) return named;
  return findAppBundle(searchRoot);
}

function runFindIosSimulatorApp(root) {
  const script = join(__dirname, "find-ios-simulator-app.mjs");
  const r = spawnSync(process.execPath, [script, root], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    process.stderr.write(r.stderr || "");
    process.exit(r.status ?? 1);
  }
  return (r.stdout || "").trim();
}

function cmdPackage() {
  const root = process.argv[3] ?? defaultRoot;
  const appPath = runFindIosSimulatorApp(root);
  if (!appPath || !existsSync(appPath)) {
    console.error(`appspresso: Simulator .app not found under ${root}`);
    process.exit(1);
  }

  const outDir = join(root, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const zipPath = join(outDir, "ios-simulator-app.zip");
  const ditto = spawnSync(
    "ditto",
    ["-c", "-k", "--keepParent", appPath, zipPath],
    { stdio: "inherit" },
  );
  if (ditto.status !== 0) {
    process.exit(ditto.status ?? 1);
  }
  console.log(zipPath);
}

function cmdResolve() {
  const artifactDir = process.argv[3];
  if (!artifactDir) {
    console.error("usage: ios-simulator-artifact.mjs resolve <artifactDir>");
    process.exit(1);
  }

  const zipCandidates = [
    join(artifactDir, "ios-simulator-app.zip"),
    join(dirname(artifactDir), "ios-simulator-app.zip"),
  ];
  const zipPath = zipCandidates.find((p) => existsSync(p));
  const searchRoots = [artifactDir];

  if (zipPath) {
    const unpackDir = join(artifactDir, "_unpacked");
    mkdirSync(unpackDir, { recursive: true });
    const unzip = spawnSync("unzip", ["-qo", zipPath, "-d", unpackDir], {
      stdio: "inherit",
    });
    if (unzip.status !== 0) {
      process.exit(unzip.status ?? 1);
    }
    searchRoots.unshift(unpackDir);
  }

  for (const root of searchRoots) {
    const app = resolveAppInTree(root);
    if (app) {
      console.log(app);
      return;
    }
  }

  console.error(
    `appspresso: App.app not found under ${artifactDir} (expected ios-simulator-app.zip or *.app bundle).`,
  );
  process.exit(1);
}

const sub = process.argv[2];
if (sub === "package") {
  cmdPackage();
} else if (sub === "resolve") {
  cmdResolve();
} else {
  console.error(
    "usage: ios-simulator-artifact.mjs package [repoRoot] | resolve <artifactDir>",
  );
  process.exit(1);
}
