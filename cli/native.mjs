import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  findAndroidProjectDir,
  findAppspressoProjectRoot,
  findCapacitorCli,
  findIosXcodeProject,
  hasNpmScript,
} from "./paths.mjs";
import { runCapConfig } from "./cap-config.mjs";
import { runInherit } from "./run-cmd.mjs";

/** Capacitor CLI cwd: folder with `appspresso.config.ts` (+ `android/` / `ios/`). */
function resolveCapacitorRoot(cwd) {
  return findAppspressoProjectRoot(cwd) ?? cwd;
}

async function ensureCapacitorConfigJson(capRoot) {
  if (existsSync(join(capRoot, "appspresso.config.ts"))) {
    await runCapConfig(capRoot);
  }
}

function printNativeHelp() {
  console.error(`native commands: sync | open | run | assemble

  appspresso native sync [--skip-build] [...extra cap sync args]
  appspresso native open <android|ios> [...]
  appspresso native run <android|ios> [...]
  appspresso native assemble android [debug|release] [--release] [...gradle args]
  appspresso native assemble ios [debug|release] [--release] [...xcodebuild args]`);
}

/** Prefer JAVA_HOME; on macOS try Homebrew openjdk@21 if unset. */
function javaHomeForGradle() {
  const fromEnv = process.env.JAVA_HOME;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  if (process.platform !== "darwin") return null;
  try {
    const prefix = execSync("brew --prefix openjdk@21", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const home = join(prefix, "libexec/openjdk.jdk/Contents/Home");
    if (existsSync(home)) return home;
  } catch {
    /* brew missing or formula absent */
  }
  return null;
}

/** When Capacitor `webDir` is `demo/dist`, `npm run build` at repo root is the wrong artefact — use `demo:build`. */
function capacitorWebDirIsDemoDist(cwd) {
  const capRoot = resolveCapacitorRoot(cwd);
  const names = ["capacitor.config.json"];
  for (const name of names) {
    const p = join(capRoot, name);
    if (!existsSync(p)) continue;
    try {
      const text = readFileSync(p, "utf8");
      if (/webDir:\s*["']demo\/dist["']/.test(text)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/**
 * @param {string[]} raw
 * @returns {{ skipBuild: boolean; capArgs: string[] }}
 */
function parseSyncArgs(raw) {
  const capArgs = [];
  let skipBuild = false;
  for (const a of raw) {
    if (a === "--skip-build") skipBuild = true;
    else capArgs.push(a);
  }
  return { skipBuild, capArgs };
}

/**
 * @param {string} cwd
 * @param {string[]} argv
 */
export async function cmdNativeSync(cwd, argv) {
  const capCli = findCapacitorCli(cwd);
  if (!capCli) {
    console.error(
      "appspresso: @capacitor/cli not found. Install it in your project.",
    );
    process.exit(1);
  }

  const capRoot = resolveCapacitorRoot(cwd);
  const { skipBuild, capArgs } = parseSyncArgs(argv);

  if (!skipBuild) {
    if (capacitorWebDirIsDemoDist(cwd) && hasNpmScript(cwd, "demo:build")) {
      await runInherit("npm", ["run", "demo:build"], { cwd });
    } else if (hasNpmScript(cwd, "build")) {
      await runInherit("npm", ["run", "build"], { cwd });
    } else {
      console.error(
        'appspresso: no "build" script in package.json; add one or use --skip-build.',
      );
      process.exit(1);
    }
  }

  await ensureCapacitorConfigJson(capRoot);
  await runInherit(process.execPath, [capCli, "sync", ...capArgs], {
    cwd: capRoot,
    shell: false,
  });
}

/**
 * @param {string} cwd
 * @param {string[]} argv
 */
export async function cmdNativeOpen(cwd, argv) {
  const platform = argv[0];
  if (platform !== "android" && platform !== "ios") {
    printNativeHelp();
    process.exit(1);
  }

  const capCli = findCapacitorCli(cwd);
  if (!capCli) {
    console.error(
      "appspresso: @capacitor/cli not found. Install it in your project.",
    );
    process.exit(1);
  }

  const capRoot = resolveCapacitorRoot(cwd);
  const rest = argv.slice(1);
  await ensureCapacitorConfigJson(capRoot);
  await runInherit(process.execPath, [capCli, "open", platform, ...rest], {
    cwd: capRoot,
    shell: false,
  });
}

/**
 * @param {string} cwd
 * @param {string[]} argv
 */
export async function cmdNativeRun(cwd, argv) {
  const platform = argv[0];
  if (platform !== "android" && platform !== "ios") {
    printNativeHelp();
    process.exit(1);
  }

  const capCli = findCapacitorCli(cwd);
  if (!capCli) {
    console.error(
      "appspresso: @capacitor/cli not found. Install it in your project.",
    );
    process.exit(1);
  }

  const capRoot = resolveCapacitorRoot(cwd);
  const rest = argv.slice(1);
  await ensureCapacitorConfigJson(capRoot);
  await runInherit(process.execPath, [capCli, "run", platform, ...rest], {
    cwd: capRoot,
    shell: false,
  });
}

/**
 * @param {string} cwd
 * @param {string[]} argv
 */
async function cmdNativeAssembleIos(cwd, argv) {
  if (process.platform !== "darwin") {
    console.error(
      "appspresso: iOS assemble requires macOS (Xcode). Use GitHub Actions macos-* runners in CI.",
    );
    process.exit(1);
  }

  let configuration = "Debug";
  const xcodeExtra = [];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--release" || a === "release") configuration = "Release";
    else if (a === "debug") configuration = "Debug";
    else xcodeExtra.push(a);
  }

  const ios = findIosXcodeProject(cwd);
  if (!ios) {
    console.error(
      "appspresso: iOS project not found (App.xcworkspace). Run `npx cap add ios` from the repo root or demo/.",
    );
    process.exit(1);
  }

  const appDir = join(ios.workspace, "..");
  const derivedDataPath = join(appDir, "build");
  await runInherit("pod", ["install"], { cwd: appDir, shell: false });

  const isWorkspace = ios.workspace.endsWith(".xcworkspace");
  const projectFlag = isWorkspace ? "-workspace" : "-project";
  const destination = "generic/platform=iOS Simulator,name=iPhone 16,OS=latest";

  await runInherit(
    "xcodebuild",
    [
      projectFlag,
      ios.workspace,
      "-scheme",
      ios.scheme,
      "-configuration",
      configuration,
      "-destination",
      destination,
      "-derivedDataPath",
      derivedDataPath,
      "CODE_SIGNING_ALLOWED=NO",
      "build",
      ...xcodeExtra,
    ],
    { cwd: appDir, shell: false },
  );
}

export async function cmdNativeAssemble(cwd, argv) {
  const platform = argv[0];
  if (platform === "ios") {
    return cmdNativeAssembleIos(cwd, argv.slice(1));
  }
  if (platform !== "android") {
    printNativeHelp();
    process.exit(1);
  }

  let variant = "debug";
  const gradleExtra = [];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--release") variant = "release";
    else if (a === "release") variant = "release";
    else if (a === "debug") variant = "debug";
    else gradleExtra.push(a);
  }

  const androidDir = findAndroidProjectDir(cwd);
  if (!androidDir) {
    console.error(
      "appspresso: Android project not found (no gradlew). Run from demo/ or repo root.",
    );
    process.exit(1);
  }

  const task = variant === "release" ? "assembleRelease" : "assembleDebug";
  const isWin = process.platform === "win32";
  const gradleCmd = isWin ? "gradlew.bat" : "./gradlew";

  const java = javaHomeForGradle();
  /** @type {NodeJS.ProcessEnv | undefined} */
  const env =
    java != null
      ? {
          ...process.env,
          JAVA_HOME: java,
          PATH: `${join(java, "bin")}${isWin ? ";" : ":"}${process.env.PATH ?? ""}`,
        }
      : undefined;

  await runInherit(gradleCmd, [task, ...gradleExtra], {
    cwd: androidDir,
    shell: isWin,
    env,
  });
}

/**
 * @param {string} cwd
 * @param {string} sub
 * @param {string[]} argv
 */
export async function routeNative(cwd, sub, argv) {
  if (sub === "sync") return cmdNativeSync(cwd, argv);
  if (sub === "open") return cmdNativeOpen(cwd, argv);
  if (sub === "run") return cmdNativeRun(cwd, argv);
  if (sub === "assemble") return cmdNativeAssemble(cwd, argv);
  printNativeHelp();
  process.exit(1);
}
