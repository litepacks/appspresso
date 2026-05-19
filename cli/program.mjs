import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  APPSPRESSO_MOTTO,
  formatVersionBanner,
  readPackageVersion,
  runInit,
  runDoctor as runSharedDoctor,
} from "@appspresso/cli-shared";
import cac from "cac";
import { runCapConfig } from "./cap-config.mjs";
import { routeNative } from "./native.mjs";
import { findCapacitorCli, findViteCli } from "./paths.mjs";
import { npmScriptCommands, runNpmScriptCommand } from "./scripts.mjs";
import { runViteCommand } from "./vite.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

/**
 * @param {string[]} [argv] defaults to process.argv
 */
export async function runProgram(argv = process.argv) {
  const cli = cac("appspresso");
  const version = readPackageVersion(packageRoot);

  cli.version(version);
  cli.help((sections) => {
    return `${formatVersionBanner({ packageRoot })}\n${APPSPRESSO_MOTTO}\n\n${sections}`;
  });

  cli
    .command("init [dir]", "Scaffold or integrate Appspresso into a project")
    .option("--config <file>", "Load appspresso.init.json")
    .option("--package-name <name>", "npm package name")
    .option("--scope <@org>", "npm scope for package name")
    .option("--display-name <name>", "App display name")
    .option("--app-id <id>", "Native bundle id")
    .option("--src-dir <path>", "Source folder (scaffold)")
    .option("--public-dir <path>", "Public folder (scaffold)")
    .option("--version <semver>", "Initial version")
    .option("--appspresso <range>", "appspresso semver range", {
      default: "^0.0.0",
    })
    .option("--with-capacitor", "Add Capacitor dependencies and scripts")
    .option("--web-only", "Web-first README note")
    .option("--write-manifest", "Write appspresso.init.json")
    .option("--skip-install", "Skip npm install (scaffold)")
    .option("--force", "Overwrite existing config (integrate)")
    .option("-y, --yes", "Skip interactive prompts")
    .action(async (dir, options) => {
      const args = buildInitArgv(dir, options);
      await runInit(args, { entry: "init" });
    });

  cli
    .command("doctor", "Environment quick check (Node, Vite, Capacitor)")
    .action(async () => {
      await runSharedDoctor(process.cwd(), {
        findViteCli,
        findCapacitorCli,
      });
    });

  cli
    .command("cap:config", "appspresso.config.ts → capacitor.config.json")
    .action(async () => {
      await runCapConfig(process.cwd());
    });

  cli
    .command(
      "native <sub> [platform] [variant]",
      "Native workflows: sync | open | run | assemble",
    )
    .allowUnknownOptions()
    .action(async (sub, platform, variant, options) => {
      await routeNative(
        process.cwd(),
        sub,
        buildNativePassthrough(platform, variant, options),
      );
    });

  for (const name of ["dev", "build", "preview"]) {
    cli
      .command(`${name} [...args]`, `Run Vite ${name}`)
      .allowUnknownOptions()
      .action((args) => {
        runViteCommand(process.cwd(), name, args ?? []);
      });
  }

  for (const scriptName of npmScriptCommands) {
    cli
      .command(`${scriptName} [...args]`, `npm run ${scriptName}`)
      .allowUnknownOptions()
      .action(async (args) => {
        await runNpmScriptCommand(process.cwd(), scriptName, args ?? []);
      });
  }

  cli.help();

  cli.parse(normalizeArgv(argv), { run: false });

  if (!cli.matchedCommand && !cli.options.help && !cli.options.version) {
    cli.outputHelp();
    process.exit(1);
  }

  const result = cli.runMatchedCommand();
  if (result instanceof Promise) await result;
}

/** Map `appspresso help` → `appspresso --help` (backward compatible with pre-cac CLI). */
function normalizeArgv(argv) {
  const args = [...argv];
  if (args[2] === "help") {
    args[2] = "--help";
  }
  return args;
}

/**
 * @param {string | undefined} platform
 * @param {string | undefined} variant
 * @param {Record<string, unknown> & { "--"?: string[] }} options
 */
function buildNativePassthrough(platform, variant, options) {
  const passthrough = [];
  if (platform) passthrough.push(platform);
  if (variant) passthrough.push(variant);
  if (options.skipBuild) passthrough.push("--skip-build");
  if (options.release) passthrough.push("--release");
  const unknown = options["--"] ?? [];
  return [...passthrough, ...unknown];
}

/**
 * @param {string | undefined} dir
 * @param {Record<string, unknown>} options
 */
function buildInitArgv(dir, options) {
  const args = [];
  if (dir) args.push(dir);
  if (options.config) args.push("--config", String(options.config));
  if (options.packageName)
    args.push("--package-name", String(options.packageName));
  if (options.scope) args.push("--scope", String(options.scope));
  if (options.displayName)
    args.push("--display-name", String(options.displayName));
  if (options.appId) args.push("--app-id", String(options.appId));
  if (options.srcDir) args.push("--src-dir", String(options.srcDir));
  if (options.publicDir) args.push("--public-dir", String(options.publicDir));
  if (options.version) args.push("--version", String(options.version));
  if (options.appspresso) args.push("--appspresso", String(options.appspresso));
  if (options.withCapacitor) args.push("--with-capacitor");
  if (options.webOnly) args.push("--web-only");
  if (options.writeManifest) args.push("--write-manifest");
  if (options.skipInstall) args.push("--skip-install");
  if (options.force) args.push("--force");
  if (options.yes) args.push("--yes");
  return args;
}
