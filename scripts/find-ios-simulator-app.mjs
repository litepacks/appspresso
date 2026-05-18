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

function findAppBundle(dir, depth = 0) {
  if (depth > 10 || !existsSync(dir)) return null;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (name === "App.app" && st.isDirectory()) return full;
    if (
      st.isDirectory() &&
      !name.endsWith(".framework") &&
      !name.endsWith(".xcframework")
    ) {
      const nested = findAppBundle(full, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

const candidates = [
  join(root, "demo/ios/App/build/Build/Products/Debug-iphonesimulator/App.app"),
];

for (const p of candidates) {
  if (existsSync(p)) {
    console.log(p);
    process.exit(0);
  }
}

const buildRoot = join(root, "demo/ios/App/build");
const found = findAppBundle(buildRoot);
if (found) {
  console.log(found);
  process.exit(0);
}

console.error(
  `appspresso: App.app not found under ${buildRoot}. Run appspresso native assemble ios first.`,
);
process.exit(1);
