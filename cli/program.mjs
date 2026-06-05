import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  APPSPRESSO_MOTTO,
  formatVersionBanner,
  readPackageVersion,
  runInit,
  runDoctor as runSharedDoctor,
  runInfo as runSharedInfo,
} from "@appspresso/cli-shared";
import cac from "cac";
import { runAnalyze } from "./analyze.mjs";
import { runCapConfig } from "./cap-config.mjs";
import { runClean } from "./clean.mjs";
import { routeNative } from "./native.mjs";
import { findCapacitorCli, findViteCli } from "./paths.mjs";
import { npmScriptCommands, runNpmScriptCommand } from "./scripts.mjs";
import { runSyncCommand } from "./sync.mjs";
import { runStudio } from "./studio.mjs";
import {
  runModuleAdd,
  runModuleRemove,
  runModuleList,
  runModuleDoctor,
  runModuleInfo,
} from "../packages/cli-shared/module.mjs";
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
      default: "^0.1.0",
    })
    .option("--template <name>", "minimal or showcase", {
      default: "minimal",
    })
    .option("--with-capacitor", "Add Capacitor dependencies and scripts")
    .option("--web-only", "Web-first README note")
    .option("--write-manifest", "Write appspresso.init.json")
    .option("--skip-install", "Skip npm install (scaffold)")
    .option("--force", "Overwrite existing config (integrate)")
    .option("-y, --yes", "Skip interactive prompts")
    .action(async (dir, options) => {
      const args = buildInitArgv(dir, options);
      await runInit(args, {
        entry: "init",
        findCapacitorCli,
      });
    });

  cli
    .command("create [dir]", "Scaffold a new Appspresso app (alias for init)")
    .option("--config <file>", "Load appspresso.init.json")
    .option("--package-name <name>", "npm package name")
    .option("--scope <@org>", "npm scope for package name")
    .option("--display-name <name>", "App display name")
    .option("--app-id <id>", "Native bundle id")
    .option("--template <name>", "minimal or showcase", { default: "minimal" })
    .option("--appspresso <range>", "appspresso semver range", {
      default: "^0.1.0",
    })
    .option("--with-capacitor", "Add Capacitor dependencies and scripts")
    .option("--web-only", "Web-first README note")
    .option("--write-manifest", "Write appspresso.init.json")
    .option("--skip-install", "Skip npm install")
    .option("-y, --yes", "Skip interactive prompts")
    .action(async (dir, options) => {
      const args = buildInitArgv(dir, options);
      await runInit(args, {
        entry: "create",
        findCapacitorCli,
      });
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
    .command("info", "Project summary (app id, deps, native folders)")
    .option("--map", "Show file map hints")
    .action(async (options) => {
      await runSharedInfo(process.cwd(), { map: Boolean(options.map) });
    });

  cli.command("analyze", "Report dist/assets sizes after build").action(() => {
    runAnalyze(process.cwd());
  });

  cli
    .command("studio", "Local Studio UI for typed project configuration")
    .option("--check", "Validate all Studio domains (CI)")
    .option("--json", "Machine-readable check report")
    .option("--port <n>", "Studio server port", { default: 5178 })
    .action(async (options) => {
      await runStudio(process.cwd(), {
        check: Boolean(options.check),
        json: Boolean(options.json),
        port: Number(options.port),
      });
    });

  cli
    .command("config validate", "Alias for `appspresso studio --check`")
    .option("--json", "Machine-readable check report")
    .action(async (options) => {
      await runStudio(process.cwd(), {
        check: true,
        json: Boolean(options.json),
      });
    });

  cli
    .command("clean", "Remove dist, coverage, and native build caches")
    .option("-y, --yes", "Skip confirmation")
    .action(async (options) => {
      await runClean(process.cwd(), { yes: Boolean(options.yes) });
    });

  cli
    .command("cap:config", "appspresso.config.ts → capacitor.config.json")
    .action(async () => {
      await runCapConfig(process.cwd());
    });

  cli
    .command("add <module>", "Install an Appspresso app module")
    .action(async (name) => {
      await runModuleAdd(process.cwd(), name);
    });

  cli
    .command("remove <module>", "Remove an Appspresso app module")
    .action(async (name) => {
      await runModuleRemove(process.cwd(), name);
    });

  cli
    .command("module <sub> [name]", "Module tools: list | doctor | info")
    .action(async (sub, name) => {
      const cwd = process.cwd();
      if (sub === "list") runModuleList(cwd);
      else if (sub === "doctor") runModuleDoctor(cwd);
      else if (sub === "info" && name) runModuleInfo(cwd, name);
      else {
        console.log("Usage: appspresso module list | doctor | info <name>");
        process.exit(1);
      }
    });

  cli
    .command("sync <sub>", "Offline sync diagnostics (status, check, flush, …)")
    .action(async (sub) => {
      await runSyncCommand(sub ?? "", process.cwd());
    });

  cli
    .command("outbox <sub> [id]", "Outbox helpers (list, retry — in-app for live DB)")
    .action(async (sub, id) => {
      if (sub === "list") {
        console.log("Use listOutboxJobs() from appspresso/sync in the running app.");
        return;
      }
      if (sub === "retry" && id) {
        console.log(`Use retryOutboxJob(${id}) from appspresso/sync in the running app.`);
        return;
      }
      console.log("Usage: appspresso outbox list | appspresso outbox retry <id>");
      process.exit(1);
    });

  cli
    .command(
      "native <sub> [platform] [variant]",
      "Native workflows: sync | open | run | assemble | verify",
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
  if (options.template) args.push("--template", String(options.template));
  if (options.withCapacitor) args.push("--with-capacitor");
  if (options.webOnly) args.push("--web-only");
  if (options.writeManifest) args.push("--write-manifest");
  if (options.skipInstall) args.push("--skip-install");
  if (options.force) args.push("--force");
  if (options.yes) args.push("--yes");
  return args;
}
