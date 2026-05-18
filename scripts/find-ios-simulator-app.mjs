#!/usr/bin/env node
/**
 * Prints the path to the iOS Simulator .app bundle after `appspresso native assemble ios`.
 * Usage: node scripts/find-ios-simulator-app.mjs [repoRoot]
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root =
  process.argv[2] ?? join(fileURLToPath(new URL(".", import.meta.url)), "..");

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
    if (name.endsWith(".app") && st.isDirectory() && name !== "App.app.dSYM") {
      const parent = dir.replace(/\\/g, "/");
      if (parent.includes("iphonesimulator") || parent.includes("Simulator")) {
        return full;
      }
    }
    if (
      st.isDirectory() &&
      !name.endsWith(".framework") &&
      !name.endsWith(".xcframework") &&
      name !== "node_modules"
    ) {
      const nested = findAppBundle(full, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

/** Prefer Capacitor default product name `App.app`. */
function findNamedAppBundle(dir) {
  const direct = findAppBundle(dir);
  if (direct?.endsWith("/App.app") || direct?.endsWith("\\App.app")) {
    return direct;
  }
  const named = join(
    dir,
    "Build",
    "Products",
    "Debug-iphonesimulator",
    "App.app",
  );
  if (existsSync(named)) return named;
  const release = join(
    dir,
    "Build",
    "Products",
    "Release-iphonesimulator",
    "App.app",
  );
  if (existsSync(release)) return release;
  return direct;
}

const searchRoots = [
  join(root, "demo/ios/App/build"),
  join(root, "demo/ios/App"),
  join(root, "demo/ios"),
];

for (const buildRoot of searchRoots) {
  const found = findNamedAppBundle(buildRoot);
  if (found) {
    console.log(found);
    process.exit(0);
  }
}

console.error(
  `appspresso: Simulator .app not found under demo/ios (expected demo/ios/App/build/Build/Products/*iphonesimulator/App.app after assemble).`,
);
process.exit(1);
