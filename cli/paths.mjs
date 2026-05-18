import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * @param {string} startDir
 * @returns {{ workspace: string; scheme: string } | null}
 */
export function findIosXcodeProject(startDir) {
  const iosRoots = [
    join(startDir, "ios"),
    join(startDir, "demo", "ios"),
    join(startDir, "..", "ios"),
    join(startDir, "..", "..", "ios"),
  ];
  for (const iosRoot of iosRoots) {
    const appDir = join(iosRoot, "App");
    const workspace = join(appDir, "App.xcworkspace");
    const project = join(appDir, "App.xcodeproj");
    if (existsSync(workspace)) {
      return { workspace, scheme: "App" };
    }
    if (existsSync(project)) {
      return { workspace: project, scheme: "App" };
    }
  }
  return null;
}

/** @param {string} startDir */
export function findAndroidProjectDir(startDir) {
  const candidates = [
    join(startDir, "android"),
    join(startDir, "demo", "android"),
    join(startDir, "..", "android"),
    join(startDir, "..", "..", "android"),
  ];
  const gradle = process.platform === "win32" ? "gradlew.bat" : "gradlew";
  for (const dir of candidates) {
    if (existsSync(join(dir, gradle))) return dir;
  }
  return null;
}

/**
 * @param {string} startDir
 * @param {(dir: string) => string | null} findInDir
 * @returns {string | null}
 */
export function walkUpFrom(startDir, findInDir) {
  let dir = startDir;
  for (;;) {
    const hit = findInDir(dir);
    if (hit) return hit;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** @param {string} startDir */
export function findViteCli(startDir) {
  return walkUpFrom(startDir, (dir) => {
    const candidate = join(dir, "node_modules", "vite", "bin", "vite.js");
    return existsSync(candidate) ? candidate : null;
  });
}

/** @param {string} startDir */
export function findCapacitorCli(startDir) {
  return walkUpFrom(startDir, (dir) => {
    const candidate = join(
      dir,
      "node_modules",
      "@capacitor",
      "cli",
      "bin",
      "capacitor",
    );
    return existsSync(candidate) ? candidate : null;
  });
}

/** @param {string} cwd */
/** @param {string} scriptName */
export function hasNpmScript(cwd, scriptName) {
  try {
    const raw = readFileSync(join(cwd, "package.json"), "utf8");
    const p = JSON.parse(raw);
    return typeof p?.scripts?.[scriptName] === "string";
  } catch {
    return false;
  }
}

/**
 * Nearest directory (walk up from startDir) whose package.json defines the script
 * and does not only forward to `appspresso <scriptName>` (avoids recursion from workspace demo packages).
 * @param {string} startDir
 * @param {string} scriptName
 * @returns {string | null}
 */
export function findDirWithNpmScript(startDir, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const shimRe = new RegExp(
    `^\\s*(?:npx\\s+)?appspresso\\s+${escaped}(?:\\s|$)`,
  );

  let dir = startDir;
  for (;;) {
    try {
      const raw = readFileSync(join(dir, "package.json"), "utf8");
      const p = JSON.parse(raw);
      const s = p.scripts?.[scriptName];
      if (typeof s === "string" && !shimRe.test(s)) {
        return dir;
      }
    } catch {
      /* no package.json or invalid */
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
