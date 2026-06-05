import cac from "cac";

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
 * @property {"minimal"|"showcase"} [template]
 * @property {boolean} templateFromCli
 * @property {string[]} positional
 */

/** @type {import("cac").CAC | undefined} */
let initCli;

function getInitCli() {
  if (initCli) return initCli;

  const cli = cac("init");

  cli
    .option("-h, --help", "Show help")
    .option("-y, --yes", "Skip interactive prompts")
    .option("--skip-install", "Skip npm install (scaffold)")
    .option("--with-capacitor, --hybrid", "Add Capacitor dependencies")
    .option("--web-only", "Web-first README note")
    .option("--force", "Overwrite existing config (integrate)")
    .option("--write-manifest", "Write appspresso.init.json")
    .option("--config <file>", "Load appspresso.init.json")
    .option("--appspresso <range>", "appspresso semver range", {
      default: "^0.1.0",
    })
    .option("--package-name <name>", "npm package name")
    .option("--scope <org>", "npm scope for package name")
    .option("--app-id <id>", "Native bundle id")
    .option("--display-name <name>", "App display name")
    .option("--src-dir <path>", "Source folder (scaffold)")
    .option("--public-dir <path>", "Public folder (scaffold)")
    .option("--version <semver>", "Initial version")
    .option("--template <name>", "minimal or showcase");

  initCli = cli;
  return cli;
}

/**
 * @param {string[]} argv
 * @returns {InitCliFlags}
 */
export function parseInitArgs(argv) {
  const cli = getInitCli();
  cli.parse(["node", "init", ...argv], { run: false });
  cli.globalCommand.checkUnknownOptions();

  const o = cli.options;
  const templateFromCli = argv.some(
    (a) => a === "--template" || a.startsWith("--template="),
  );

  if (
    o.template != null &&
    o.template !== "minimal" &&
    o.template !== "showcase"
  ) {
    throw new Error('--template must be "minimal" or "showcase"');
  }

  return {
    help: Boolean(o.help),
    yes: Boolean(o.yes),
    skipInstall: Boolean(o.skipInstall),
    withCapacitor: Boolean(o.withCapacitor),
    webOnly: Boolean(o.webOnly),
    force: Boolean(o.force),
    writeManifest: Boolean(o.writeManifest),
    config: o.config,
    appspresso: o.appspresso,
    packageName: o.packageName,
    scope: o.scope,
    appId: o.appId,
    displayName: o.displayName,
    srcDir: o.srcDir,
    publicDir: o.publicDir,
    version: o.version,
    template: templateFromCli
      ? /** @type {"minimal"|"showcase"} */ (o.template)
      : undefined,
    templateFromCli,
    positional: [...cli.args],
  };
}
