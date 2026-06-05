import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { runCapConfig } from "./cap-config.mjs";
import {
  findAndroidProjectDir,
  findAppspressoProjectRoot,
  findCapacitorCli,
  findIosXcodeProject,
  hasNpmScript,
} from "./paths.mjs";
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
  console.error(`native commands: sync | open | run | assemble | verify

  appspresso native sync [--skip-build] [...extra cap sync args]
  appspresso native open <android|ios> [...]
  appspresso native run <android|ios> [...]
  appspresso native assemble android [debug|release] [--release] [...gradle args]
  appspresso native assemble ios [debug|release] [--release] [...xcodebuild args]
  appspresso native verify android|ios`);
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

/**
 * Pick the web bundle build for `cap sync`.
 * Monorepo: when Capacitor root is `demo/` but cwd is repo root, run `demo:build`
 * (or build inside capRoot), not root `npm run build`.
 * @returns {{ cmd: string; args: string[]; cwd: string } | null}
 */
function resolveNativeBuildInvocation(cwd) {
  const capRoot = resolveCapacitorRoot(cwd);

  if (capRoot !== cwd && hasNpmScript(cwd, "demo:build")) {
    return { cmd: "npm", args: ["run", "demo:build"], cwd };
  }

  if (
    capRoot !== cwd &&
    existsSync(join(capRoot, "package.json")) &&
    hasNpmScript(capRoot, "build")
  ) {
    return { cmd: "npm", args: ["run", "build"], cwd: capRoot };
  }

  if (hasNpmScript(cwd, "build")) {
    return { cmd: "npm", args: ["run", "build"], cwd };
  }

  return null;
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
    const build = resolveNativeBuildInvocation(cwd);
    if (!build) {
      console.error(
        'appspresso: no "build" script in package.json; add one or use --skip-build.',
      );
      process.exit(1);
    }
    await runInherit(build.cmd, build.args, { cwd: build.cwd });
  }

  await ensureCapacitorConfigJson(capRoot);
  const hasPlatform = capArgs.some(
    (a) => a === "android" || a === "ios" || a === "web",
  );
  await runInherit(process.execPath, [capCli, "sync", ...capArgs], {
    cwd: capRoot,
    shell: false,
  });
  if (hasPlatform) {
    const platform = capArgs.find(
      (a) => a === "android" || a === "ios" || a === "web",
    );
    if (platform) {
      await runInherit(process.execPath, [capCli, "copy", platform], {
        cwd: capRoot,
        shell: false,
      });
    }
  }
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
/**
 * @param {string} cwd
 * @param {string[]} argv
 */
function findMonorepoRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (existsSync(join(dir, "scripts", "verify-native-web-bundle.mjs"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}

export async function cmdNativeVerify(cwd, argv) {
  const platform = argv[0];
  if (platform !== "android" && platform !== "ios") {
    printNativeHelp();
    process.exit(1);
  }

  const scriptsRoot = findMonorepoRoot(cwd);
  const capRoot = resolveCapacitorRoot(cwd);

  const runScript = (rel) =>
    runInherit(process.execPath, [join(scriptsRoot, rel)], {
      cwd: scriptsRoot,
      shell: false,
    });

  if (platform === "android") {
    await runScript("scripts/verify-native-web-bundle.mjs");
    await runScript("scripts/verify-cap-android-public.mjs");
    const apk = join(
      scriptsRoot,
      "demo/android/app/build/outputs/apk/debug/app-debug.apk",
    );
    if (existsSync(apk)) {
      await runInherit(
        process.execPath,
        [join(scriptsRoot, "scripts/debug/verify-apk-contents.mjs"), apk],
        { cwd: scriptsRoot, shell: false },
      );
    } else {
      console.log(
        "appspresso: APK not built yet — run appspresso native assemble android",
      );
    }
    return;
  }

  const iosPublic = join(capRoot, "ios", "App", "App", "public", "index.html");
  if (!existsSync(iosPublic)) {
    console.error(`appspresso: missing ${iosPublic} — run cap sync ios`);
    process.exit(1);
  }
  console.log(`iOS web bundle OK (${iosPublic})`);
}

export async function routeNative(cwd, sub, argv) {
  if (sub === "sync") return cmdNativeSync(cwd, argv);
  if (sub === "open") return cmdNativeOpen(cwd, argv);
  if (sub === "run") return cmdNativeRun(cwd, argv);
  if (sub === "assemble") return cmdNativeAssemble(cwd, argv);
  if (sub === "verify") return cmdNativeVerify(cwd, argv);
  printNativeHelp();
  process.exit(1);
}
