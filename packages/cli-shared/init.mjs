import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { formatVersionBanner } from "./branding.mjs";
import { runIntegrate } from "./integrate.mjs";
import {
  assertNpmPackageName,
  defaultPaths,
  loadManifestFile,
  normalizeManifest,
  suggestAppId,
  toDisplayName,
  validateManifest,
  writeInitManifest,
} from "./manifest.mjs";
import { parseInitArgs } from "./parse-init-args.mjs";
import { ensureProjectDir, runNpmInstall, runScaffold } from "./scaffold.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function isInteractive(flags) {
  return process.stdin.isTTY && !flags.yes && !process.env.CI;
}

/**
 * @param {"create"|"init"} entry
 */
export function printInitHelp(entry) {
  const cmd =
    entry === "create" ? "npm create appspresso@latest" : "appspresso init";
  console.log(`Usage:
  ${cmd} <directory> [options]

Options:
  --config <file>        Load appspresso.init.json
  --package-name <name>  npm package name (scoped allowed)
  --scope <@org>         With --package-name, build @org/name
  --display-name <name>  App display name
  --app-id <id>          Native bundle id (com.example.app)
  --src-dir <path>       Source folder (scaffold remap, default: src)
  --public-dir <path>    Public folder (scaffold remap, default: public)
  --version <semver>     Initial version (default: 0.0.0)
  --appspresso <range>   appspresso semver range (default: ^0.0.0)
  --with-capacitor       Capacitor deps and cap scripts
  --web-only             Web-first README note (not with --with-capacitor)
  --write-manifest       Write appspresso.init.json after setup
  --skip-install         Skip npm install (scaffold)
  --force                Overwrite existing config (integrate)
  --yes, -y              Skip interactive prompts
  -h, --help             Show help

Examples:
  ${cmd} my-app
  ${cmd} my-app -- --with-capacitor
  ${cmd} my-app -- --config ./team.init.json
  ${cmd} . --package-name @acme/my-app --app-id com.acme.myapp
`);
}

/**
 * @param {string} projectDir
 */
function detectMode(projectDir) {
  if (!existsSync(projectDir)) return "scaffold";
  const pkgPath = join(projectDir, "package.json");
  if (!existsSync(pkgPath)) {
    const entries = readdirSync(projectDir);
    if (entries.length === 0) return "scaffold";
    throw new Error(
      `Directory exists but has no package.json: ${projectDir}. Use an empty folder or integrate into an existing app.`,
    );
  }
  return "integrate";
}

/**
 * @param {string} dirArg
 */
function derivePackageNameFromDir(dirArg) {
  const name = dirArg.replace(/\\/g, "/").split("/").pop();
  if (!name || name === "." || name === "..") {
    throw new Error(`Could not derive package name from "${dirArg}"`);
  }
  return name;
}

/**
 * @param {import("./parse-init-args.mjs").InitCliFlags} flags
 * @param {string} projectDir
 * @param {string} dirArg
 * @param {string} mode
 */
async function resolveManifest(flags, projectDir, dirArg, mode) {
  /** @type {import("./manifest.mjs").InitManifest} */
  let base = normalizeManifest({
    paths: defaultPaths(),
    version: "0.0.0",
    appspressoVersion: flags.appspresso ?? "^0.0.0",
    capacitor: flags.withCapacitor,
    scaffold: { template: "default" },
  });

  if (flags.config) {
    const loaded = loadManifestFile(resolve(process.cwd(), flags.config));
    base = { ...base, ...loaded, paths: { ...base.paths, ...loaded.paths } };
  }

  if (mode === "integrate" && existsSync(join(projectDir, "package.json"))) {
    const pkg = JSON.parse(
      readFileSync(join(projectDir, "package.json"), "utf8"),
    );
    if (pkg.name && !flags.packageName) base.packageName = pkg.name;
  } else if (!flags.packageName) {
    base.packageName = derivePackageNameFromDir(dirArg);
  }

  if (flags.packageName) {
    if (flags.scope && !flags.packageName.includes("/")) {
      const scope = flags.scope.startsWith("@")
        ? flags.scope
        : `@${flags.scope}`;
      base.packageName = `${scope}/${flags.packageName}`;
    } else {
      base.packageName = flags.packageName;
    }
  }

  if (flags.displayName) base.displayName = flags.displayName;
  if (flags.appId) base.appId = flags.appId;
  if (flags.version) base.version = flags.version;
  if (flags.srcDir) base.paths.src = flags.srcDir;
  if (flags.publicDir) base.paths.public = flags.publicDir;
  if (flags.appspresso) base.appspressoVersion = flags.appspresso;

  if (flags.withCapacitor) base.capacitor = true;
  if (flags.webOnly) base.capacitor = false;

  if (!base.displayName && base.packageName) {
    base.displayName = toDisplayName(base.packageName);
  }
  if (!base.appId && base.packageName) {
    base.appId = suggestAppId(base.packageName, flags.scope);
  }

  const interactive = isInteractive(flags);
  if (interactive) {
    p.intro(formatVersionBanner());

    if (!flags.config && !flags.packageName) {
      const useScoped = await p.confirm({
        message: "Scoped npm package (@org/name)?",
        initialValue: base.packageName.startsWith("@"),
      });
      if (p.isCancel(useScoped)) p.cancel("Cancelled");
      if (useScoped) {
        const scope = await p.text({
          message: "Scope (without @)",
          placeholder: "acme",
          validate: (v) => (v?.trim() ? undefined : "Required"),
        });
        if (p.isCancel(scope)) p.cancel("Cancelled");
        const short = await p.text({
          message: "Package name",
          placeholder: derivePackageNameFromDir(dirArg),
          defaultValue: slugFromDir(dirArg),
          validate: (v) => (v?.trim() ? undefined : "Required"),
        });
        if (p.isCancel(short)) p.cancel("Cancelled");
        base.packageName = `@${scope.replace(/^@/, "")}/${short}`;
      } else {
        const name = await p.text({
          message: "npm package name",
          defaultValue: base.packageName,
          validate: (v) => {
            try {
              assertNpmPackageName(v ?? "");
              return undefined;
            } catch (e) {
              return e instanceof Error ? e.message : "Invalid name";
            }
          },
        });
        if (p.isCancel(name)) p.cancel("Cancelled");
        base.packageName = name;
      }
    }

    if (!flags.displayName) {
      const dn = await p.text({
        message: "Display name",
        defaultValue: base.displayName || toDisplayName(base.packageName),
      });
      if (p.isCancel(dn)) p.cancel("Cancelled");
      base.displayName = dn;
    }

    if (!flags.appId) {
      const id = await p.text({
        message: "App id (bundle identifier)",
        defaultValue: base.appId,
        validate: (v) =>
          v && /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(v)
            ? undefined
            : "Use reverse-DNS form (e.g. com.example.app)",
      });
      if (p.isCancel(id)) p.cancel("Cancelled");
      base.appId = id;
    }

    if (mode === "scaffold" && !flags.srcDir && !flags.publicDir) {
      const customLayout = await p.confirm({
        message: "Customize src/public folders?",
        initialValue: false,
      });
      if (p.isCancel(customLayout)) p.cancel("Cancelled");
      if (customLayout) {
        const src = await p.text({
          message: "Source directory",
          defaultValue: "src",
        });
        if (p.isCancel(src)) p.cancel("Cancelled");
        const pub = await p.text({
          message: "Public directory",
          defaultValue: "public",
        });
        if (p.isCancel(pub)) p.cancel("Cancelled");
        base.paths.src = src;
        base.paths.public = pub;
      }
    }

    if (!flags.withCapacitor && !flags.webOnly) {
      const cap = await p.select({
        message: "Native shells",
        options: [
          { value: "web", label: "Web only" },
          { value: "hybrid", label: "With Capacitor (Android/iOS later)" },
        ],
      });
      if (p.isCancel(cap)) p.cancel("Cancelled");
      base.capacitor = cap === "hybrid";
    }

    if (!flags.writeManifest) {
      const wm = await p.confirm({
        message: "Write appspresso.init.json for next time?",
        initialValue: false,
      });
      if (p.isCancel(wm)) p.cancel("Cancelled");
      if (wm) flags.writeManifest = true;
    }

    if (mode === "scaffold" && !flags.skipInstall) {
      const inst = await p.confirm({
        message: "Run npm install now?",
        initialValue: true,
      });
      if (p.isCancel(inst)) p.cancel("Cancelled");
      if (!inst) flags.skipInstall = true;
    }
  }

  validateManifest(base);
  return base;
}

function slugFromDir(dirArg) {
  return (
    dirArg
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase()
      .replace(/^-+|-+$/g, "") || "my-app"
  );
}

/**
 * @param {string[]} argv
 * @param {{ entry?: "create"|"init", templateDir?: string }} [opts]
 */
export async function runInit(argv, opts = {}) {
  const entry = opts.entry ?? "init";
  const flags = parseInitArgs(argv);

  if (flags.help) {
    printInitHelp(entry);
    return;
  }

  if (flags.withCapacitor && flags.webOnly) {
    throw new Error("Use either --with-capacitor or --web-only, not both.");
  }

  const dirArg = flags.positional[0] ?? (entry === "create" ? "" : ".");
  if (entry === "create" && !dirArg) {
    printInitHelp(entry);
    process.exit(1);
  }

  const projectDir = resolve(process.cwd(), dirArg || ".");
  const mode = detectMode(projectDir);

  let configRel = "appspresso.config.ts";
  if (flags.config) {
    const loaded = loadManifestFile(resolve(process.cwd(), flags.config));
    configRel = loaded.paths.config;
  }
  const configPath = join(projectDir, configRel);
  if (existsSync(configPath) && mode === "integrate" && !flags.force) {
    if (isInteractive(flags)) {
      const overwrite = await p.confirm({
        message: `${configRel} exists. Overwrite?`,
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Cancelled");
        process.exit(0);
      }
      flags.force = true;
    } else {
      throw new Error(
        `${configPath} already exists. Use --force to overwrite.`,
      );
    }
  }

  if (mode === "scaffold") {
    ensureProjectDir(projectDir);
  }

  const manifest = await resolveManifest(
    flags,
    projectDir,
    dirArg || ".",
    mode,
  );

  const templateDir =
    opts.templateDir ?? join(__dirname, "..", "create-appspresso", "template");

  if (mode === "scaffold") {
    runScaffold({ templateDir, projectDir, manifest });
    if (!flags.skipInstall) runNpmInstall(projectDir);
  } else {
    runIntegrate({ projectDir, manifest, force: flags.force });
  }

  if (flags.writeManifest) {
    writeInitManifest(projectDir, manifest);
  }

  const relDir = dirArg || ".";
  const next = [
    `cd ${relDir}`,
    mode === "scaffold" && flags.skipInstall ? "npm install" : null,
    manifest.capacitor ? "npx cap add android" : null,
    manifest.capacitor ? "npx cap add ios" : null,
    manifest.capacitor ? "npm run cap:sync" : null,
    "npm run dev",
  ].filter(Boolean);

  if (isInteractive(flags)) {
    p.outro(
      `${pc.green("Done")} — ${manifest.displayName} at ${projectDir}\n\nNext:\n  ${next.join("\n  ")}`,
    );
  } else {
    console.log(`
Created ${manifest.displayName} at ${projectDir}
Next:
  ${next.join("\n  ")}
`);
  }
}
