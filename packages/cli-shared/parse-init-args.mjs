/**
 * @typedef {object} InitCliFlags
 * @property {boolean} help
 * @property {boolean} yes
 * @property {boolean} skipInstall
 * @property {boolean} withCapacitor
 * @property {boolean} webOnly
 * @property {boolean} force
 * @property {boolean} writeManifest
 * @property {string} [config]
 * @property {string} [appspresso]
 * @property {string} [packageName]
 * @property {string} [scope]
 * @property {string} [appId]
 * @property {string} [displayName]
 * @property {string} [srcDir]
 * @property {string} [publicDir]
 * @property {string} [version]
 * @property {string[]} positional
 */

/**
 * @param {string[]} argv
 * @returns {InitCliFlags}
 */
export function parseInitArgs(argv) {
  const args = [...argv];
  /** @type {InitCliFlags} */
  const out = {
    help: false,
    yes: false,
    skipInstall: false,
    withCapacitor: false,
    webOnly: false,
    force: false,
    writeManifest: false,
    appspresso: "^0.0.0",
    positional: [],
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--yes" || a === "-y") {
      out.yes = true;
      continue;
    }
    if (a === "--skip-install") {
      out.skipInstall = true;
      continue;
    }
    if (a === "--with-capacitor" || a === "--hybrid") {
      out.withCapacitor = true;
      continue;
    }
    if (a === "--web-only") {
      out.webOnly = true;
      continue;
    }
    if (a === "--force") {
      out.force = true;
      continue;
    }
    if (a === "--write-manifest") {
      out.writeManifest = true;
      continue;
    }
    if (a === "--config") {
      out.config = args[++i] ?? "";
      if (!out.config) throw new Error("--config needs a file path");
      continue;
    }
    if (a === "--appspresso") {
      out.appspresso = args[++i] ?? "";
      if (!out.appspresso) throw new Error("--appspresso needs a value");
      continue;
    }
    if (a === "--package-name") {
      out.packageName = args[++i] ?? "";
      if (!out.packageName) throw new Error("--package-name needs a value");
      continue;
    }
    if (a === "--scope") {
      out.scope = args[++i] ?? "";
      if (!out.scope) throw new Error("--scope needs a value");
      continue;
    }
    if (a === "--app-id") {
      out.appId = args[++i] ?? "";
      if (!out.appId) throw new Error("--app-id needs a value");
      continue;
    }
    if (a === "--display-name") {
      out.displayName = args[++i] ?? "";
      if (!out.displayName) throw new Error("--display-name needs a value");
      continue;
    }
    if (a === "--src-dir") {
      out.srcDir = args[++i] ?? "";
      if (!out.srcDir) throw new Error("--src-dir needs a value");
      continue;
    }
    if (a === "--public-dir") {
      out.publicDir = args[++i] ?? "";
      if (!out.publicDir) throw new Error("--public-dir needs a value");
      continue;
    }
    if (a === "--version") {
      out.version = args[++i] ?? "";
      if (!out.version) throw new Error("--version needs a value");
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    out.positional.push(a);
  }

  return out;
}
