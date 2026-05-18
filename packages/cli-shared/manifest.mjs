import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import semver from "semver";

const NPM_NAME_RE =
  /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const APP_ID_RE = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;
const SAFE_SEGMENT_RE = /^[a-zA-Z0-9._-]+$/;

/**
 * @typedef {object} InitPaths
 * @property {string} src
 * @property {string} public
 * @property {string} config
 */

/**
 * @typedef {object} InitManifest
 * @property {string} packageName
 * @property {string} displayName
 * @property {string} appId
 * @property {string} version
 * @property {InitPaths} paths
 * @property {{ template: string }} scaffold
 * @property {boolean} capacitor
 * @property {string} appspressoVersion
 */

export function defaultPaths() {
  return { src: "src", public: "public", config: "appspresso.config.ts" };
}

/**
 * @param {string} name
 */
export function assertNpmPackageName(name) {
  if (!NPM_NAME_RE.test(name)) {
    throw new Error(
      `Invalid package name "${name}". Use lowercase letters, numbers, hyphen (optional scoped @scope/pkg).`,
    );
  }
}

/**
 * @param {string} appId
 */
export function assertAppId(appId) {
  if (!APP_ID_RE.test(appId)) {
    throw new Error(
      `Invalid app id "${appId}". Use reverse-DNS form (e.g. com.example.myapp).`,
    );
  }
}

/**
 * @param {string} segment
 * @param {string} label
 */
export function assertSafePathSegment(segment, label) {
  if (!segment || segment.includes("..") || segment.includes("\\")) {
    throw new Error(`Invalid ${label}: "${segment}"`);
  }
  const parts = segment.split("/").filter(Boolean);
  for (const p of parts) {
    if (!SAFE_SEGMENT_RE.test(p)) {
      throw new Error(`Invalid ${label} segment: "${p}"`);
    }
  }
}

/**
 * @param {Partial<InitManifest>} raw
 * @returns {InitManifest}
 */
export function normalizeManifest(raw) {
  const paths = { ...defaultPaths(), ...raw.paths };
  assertSafePathSegment(paths.src, "paths.src");
  assertSafePathSegment(paths.public, "paths.public");
  assertSafePathSegment(paths.config, "paths.config");

  const manifest = {
    packageName: raw.packageName ?? "",
    displayName: raw.displayName ?? "",
    appId: raw.appId ?? "",
    version: raw.version ?? "0.0.0",
    paths,
    scaffold: { template: raw.scaffold?.template ?? "default" },
    capacitor: raw.capacitor === true,
    appspressoVersion: raw.appspressoVersion ?? "^0.0.0",
  };

  if (manifest.scaffold.template !== "default") {
    throw new Error(
      `Unknown scaffold template "${manifest.scaffold.template}" (only "default" is available).`,
    );
  }

  return manifest;
}

/**
 * @param {InitManifest} manifest
 */
export function validateManifest(manifest) {
  if (!manifest.packageName) throw new Error("packageName is required");
  if (!manifest.displayName?.trim()) throw new Error("displayName is required");
  if (manifest.displayName.length > 120) {
    throw new Error("displayName must be at most 120 characters");
  }
  if (!manifest.appId) throw new Error("appId is required");

  assertNpmPackageName(manifest.packageName);
  assertAppId(manifest.appId);

  if (manifest.version && !semver.valid(semver.coerce(manifest.version))) {
    throw new Error(`Invalid version "${manifest.version}"`);
  }
  if (
    manifest.appspressoVersion &&
    !semver.validRange(manifest.appspressoVersion)
  ) {
    throw new Error(
      `Invalid appspresso semver range "${manifest.appspressoVersion}"`,
    );
  }
}

/**
 * @param {string} kebab
 */
export function toDisplayName(kebab) {
  return kebab
    .replace(/^@[^/]+\//, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * @param {string} packageName
 */
export function slugFromPackageName(packageName) {
  const base = packageName.replace(/^@[^/]+\//, "");
  return base.replace(/[^a-z0-9]+/gi, "").toLowerCase() || "app";
}

/**
 * @param {string} packageName
 * @param {string} [scopeHint]
 */
export function suggestAppId(packageName, scopeHint) {
  const slug = slugFromPackageName(packageName);
  let org = scopeHint?.replace(/^@/, "").split("/")[0];
  if (!org) {
    const m = packageName.match(/^@([^/]+)\//);
    org = m ? m[1].replace(/[^a-z0-9]/gi, "") : "example";
  }
  org = (org || "example").toLowerCase().replace(/[^a-z0-9]/g, "") || "example";
  return `com.${org}.${slug}`;
}

/**
 * @param {string} configPath
 */
export function loadManifestFile(configPath) {
  const raw = JSON.parse(readFileSync(configPath, "utf8"));
  const { $schema: _s, ...rest } = raw;
  const manifest = normalizeManifest(rest);
  validateManifest(manifest);
  return manifest;
}

/**
 * @param {string} projectDir
 * @param {InitManifest} manifest
 * @param {string} [filename]
 */
export function writeInitManifest(projectDir, manifest, filename = "appspresso.init.json") {
  const out = {
    $schema: "https://appspresso.dev/schemas/init.v1.json",
    packageName: manifest.packageName,
    displayName: manifest.displayName,
    appId: manifest.appId,
    version: manifest.version,
    paths: manifest.paths,
    scaffold: manifest.scaffold,
    capacitor: manifest.capacitor,
    appspressoVersion: manifest.appspressoVersion,
  };
  writeFileSync(join(projectDir, filename), `${JSON.stringify(out, null, 2)}\n`);
}

/**
 * @param {InitManifest} manifest
 */
export function placeholderMap(manifest) {
  return {
    "%%PROJECT_NAME%%": manifest.packageName,
    "%%DISPLAY_NAME%%": manifest.displayName,
    "%%APP_ID%%": manifest.appId,
    "%%VERSION%%": manifest.version,
    "%%APSPRESSO_VERSION%%": manifest.appspressoVersion,
    "%%SRC_DIR%%": manifest.paths.src,
  };
}
