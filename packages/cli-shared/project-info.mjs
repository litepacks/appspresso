import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @param {string} cwd
 */
export function readAppspressoProjectInfo(cwd) {
  const pkgPath = join(cwd, "package.json");
  const configPath = join(cwd, "appspresso.config.ts");
  const envPath = join(cwd, ".env");
  const envExamplePath = join(cwd, ".env.example");

  /** @type {Record<string, unknown>} */
  let pkg = {};
  if (existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      /* ignore */
    }
  }

  const appspressoVersion =
    typeof pkg.dependencies?.appspresso === "string"
      ? pkg.dependencies.appspresso
      : typeof pkg.devDependencies?.appspresso === "string"
        ? pkg.devDependencies.appspresso
        : null;

  let appId = null;
  let displayName = null;
  if (existsSync(configPath)) {
    const src = readFileSync(configPath, "utf8");
    const idMatch = src.match(/\bid:\s*"([^"]+)"/);
    const nameMatch = src.match(/displayName:\s*"([^"]+)"/);
    if (idMatch) appId = idMatch[1];
    if (nameMatch) displayName = nameMatch[1];
  }

  const viteEnvKeys = [
    "VITE_API_BASE_URL",
    "VITE_ENABLE_DEBUG_PANEL",
    "VITE_FEATURE_FLAGS",
    "VITE_SENTRY_DSN",
  ];

  /** @type {string[]} */
  const envPresent = [];
  /** @type {string[]} */
  const envMissing = [];
  if (existsSync(envPath)) {
    const envText = readFileSync(envPath, "utf8");
    for (const key of viteEnvKeys) {
      if (new RegExp(`^${key}=`, "m").test(envText)) envPresent.push(key);
      else envMissing.push(key);
    }
  } else {
    envMissing.push(...viteEnvKeys);
  }

  return {
    packageName: typeof pkg.name === "string" ? pkg.name : null,
    appspressoVersion,
    appId,
    displayName,
    hasConfig: existsSync(configPath),
    hasEnv: existsSync(envPath),
    hasEnvExample: existsSync(envExamplePath),
    envPresent,
    envMissing,
    hasAndroid: existsSync(join(cwd, "android")),
    hasIos: existsSync(join(cwd, "ios")),
    hasDist: existsSync(join(cwd, "dist")),
  };
}
