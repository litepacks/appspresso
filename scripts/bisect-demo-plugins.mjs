#!/usr/bin/env node
/**
 * Omit high-risk Capacitor plugins from demo first; stop when OOM disappears.
 * Usage: node scripts/bisect-demo-plugins.mjs [--wait-ms=50000] [--serial=...] [--all]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const demoRoot = join(root, "demo");
const demoPkgPath = join(demoRoot, "package.json");
const demoConfigPath = join(demoRoot, "appspresso.config.ts");
const capDepsPath = join(root, "scripts/capacitor-native-deps.json");
const apkPath = join(
  demoRoot,
  "android/app/build/outputs/apk/debug/app-debug.apk",
);
const reportPath = join(demoRoot, "plugin-omit-bisect-report.json");
const pkg = "com.example.capacitorvitepoc";

const waitArg = process.argv.find((a) => a.startsWith("--wait-ms="));
const waitMs = waitArg ? Number(waitArg.split("=")[1]) : 55_000;
const serialArg = process.argv.find((a) => a.startsWith("--serial="));
const runAll = process.argv.includes("--all");

const capDeps = JSON.parse(readFileSync(capDepsPath, "utf8")).dependencies;

/** Highest OOM / bootstrap risk first (from logcat + startup graph). */
const PRIORITY_OMITS = [
  {
    id: "omit-sqlite",
    pkg: "@capacitor-community/sqlite",
    configStrip: ["sqlite"],
    reason: "libsqlcipher native + sync/sqlite JS + deferred initDatabase",
  },
  {
    id: "omit-status-bar",
    pkg: "@capacitor/status-bar",
    configStrip: ["statusBar"],
    reason: "initAppearance() on bootstrap (StatusBar + SplashScreen)",
  },
  {
    id: "omit-network",
    pkg: "@capacitor/network",
    configStrip: [],
    reason: "initSyncLayer → network listeners at bootstrap",
  },
  {
    id: "omit-filesystem",
    pkg: "@capacitor/filesystem",
    configStrip: ["filesystem"],
    reason: "FilesystemProvider in RootProviders",
  },
  {
    id: "omit-inappbrowser",
    pkg: "@capacitor/inappbrowser",
    configStrip: [],
    reason: "heavy ionic native dependency",
  },
  {
    id: "omit-share",
    pkg: "@capacitor/share",
    configStrip: [],
    reason: "native share bridge",
  },
  {
    id: "omit-device",
    pkg: "@capacitor/device",
    configStrip: [],
    reason: "device.service",
  },
  {
    id: "omit-dialog",
    pkg: "@capacitor/dialog",
    configStrip: [],
    reason: "dialog hooks",
  },
  {
    id: "omit-action-sheet",
    pkg: "@capacitor/action-sheet",
    configStrip: [],
    reason: "action sheet hooks",
  },
  {
    id: "omit-keyboard",
    pkg: "@capacitor/keyboard",
    configStrip: [],
    reason: "keyboard listeners",
  },
];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
}

function runCapture(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", shell: false });
}

function adbArgs() {
  const serial =
    serialArg?.split("=")[1] ??
    runCapture("adb", ["devices"])
      .stdout.split("\n")
      .map((l) => l.trim())
      .find((l) => l.endsWith("\tdevice"))
      ?.split("\t")[0];
  return serial ? ["-s", serial] : [];
}

function fullDemoPkg() {
  return {
    name: "appspresso-demo",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: JSON.parse(readFileSync(demoPkgPath, "utf8")).scripts,
    dependencies: {
      ...capDeps,
      appspresso: "file:..",
    },
    devDependencies: {
      "@capacitor/cli": capDeps["@capacitor/cli"] ?? "^7.4.4",
    },
  };
}

function writeDemoPkg(omitPkg) {
  const full = fullDemoPkg();
  if (omitPkg) delete full.dependencies[omitPkg];
  writeFileSync(demoPkgPath, `${JSON.stringify(full, null, 2)}\n`);
}

function stripConfigBlocks(source, keys) {
  let out = source;
  for (const key of keys) {
    const re = new RegExp(
      `\\n\\s*${key}:\\s*\\{[\\s\\S]*?\\n\\s*\\},`,
      "m",
    );
    out = out.replace(re, "\n");
  }
  return out;
}

function writeDemoConfig(omitCase, originalConfig) {
  if (!omitCase?.configStrip?.length) {
    writeFileSync(demoConfigPath, originalConfig);
    return;
  }
  writeFileSync(
    demoConfigPath,
    stripConfigBlocks(originalConfig, omitCase.configStrip),
  );
}

function probeDevice() {
  const adb = adbArgs();
  run("adb", [...adb, "install", "-r", apkPath]);
  run("adb", [...adb, "shell", "am", "force-stop", pkg]);
  run("adb", [...adb, "logcat", "-c"]);
  run("adb", [
    ...adb,
    "shell",
    "monkey",
    "-p",
    pkg,
    "-c",
    "android.intent.category.LAUNCHER",
    "1",
  ]);
  spawnSync("sleep", [String(Math.ceil(waitMs / 1000))], { stdio: "inherit" });
  const pid = runCapture("adb", [...adb, "shell", "pidof", pkg]);
  const log = runCapture("adb", [...adb, "logcat", "-d", "-t", "400"]);
  const text = log.stdout ?? "";
  return {
    alive: Boolean(pid.stdout?.trim()),
    pid: pid.stdout?.trim() || null,
    oom: /V8 javascript OOM/i.test(text),
    rendererCrash: /Renderer process.*crash/i.test(text),
    tileMem: /tile memory limits exceeded/i.test(text),
    crashed:
      !pid.stdout?.trim() ||
      /V8 javascript OOM/i.test(text) ||
      /Renderer process.*crash/i.test(text),
  };
}

function buildNative(omitCase, originalConfig) {
  writeDemoPkg(omitCase?.pkg ?? null);
  writeDemoConfig(omitCase ?? null, originalConfig);
  run("npm", ["install"], { cwd: root });
  run(process.execPath, [join(root, "bin/appspresso.mjs"), "cap:config"], {
    cwd: demoRoot,
  });
  const capCli = join(
    root,
    "node_modules",
    "@capacitor",
    "cli",
    "bin",
    "capacitor",
  );
  run(process.execPath, [capCli, "sync", "android"], { cwd: demoRoot });
  run(process.execPath, [capCli, "copy", "android"], { cwd: demoRoot });
  const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  run(gradle, ["assembleDebug"], { cwd: join(demoRoot, "android") });
  if (!existsSync(apkPath)) throw new Error("APK missing after assembleDebug");
}

function main() {
  const originalPkg = readFileSync(demoPkgPath, "utf8");
  const originalConfig = readFileSync(demoConfigPath, "utf8");
  const capCli = join(
    root,
    "node_modules",
    "@capacitor",
    "cli",
    "bin",
    "capacitor",
  );
  if (!existsSync(capCli)) {
    console.error("bisect: @capacitor/cli missing");
    process.exit(1);
  }

  const cases = [{ id: "full", omit: null, reason: "baseline" }, ...PRIORITY_OMITS];
  const toRun = runAll ? cases : cases;
  const results = [];

  try {
    console.log("==> one-time demo web + lib build");
    writeDemoPkg(null);
    writeFileSync(demoConfigPath, originalConfig);
    run("npm", ["run", "build:lib:fast"], { cwd: root });
    run("npm", ["run", "build"], { cwd: demoRoot });

    for (const c of toRun) {
      console.log(`\n========== demo ${c.id} ==========`);
      if (c.reason) console.log(`reason: ${c.reason}`);
      try {
        buildNative(c, originalConfig);
        const stats = probeDevice();
        const entry = {
          id: c.id,
          omitted: c.pkg ?? null,
          reason: c.reason,
          ...stats,
          at: new Date().toISOString(),
        };
        results.push(entry);
        console.log(JSON.stringify(entry, null, 2));

        if (c.id !== "full" && !entry.crashed) {
          const baseline = results.find((r) => r.id === "full");
          if (baseline?.crashed && !entry.crashed) {
            console.log(`\n*** OOM fixed by omitting ${c.pkg} ***`);
            if (!runAll) break;
          }
        }
      } catch (e) {
        results.push({
          id: c.id,
          omitted: c.pkg ?? null,
          reason: c.reason,
          error: e instanceof Error ? e.message : String(e),
          crashed: true,
          at: new Date().toISOString(),
        });
        console.error(`FAILED ${c.id}:`, e);
      }
    }
  } finally {
    writeFileSync(demoPkgPath, originalPkg);
    writeFileSync(demoConfigPath, originalConfig);
  }

  writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`\nReport: ${reportPath}`);
  const fix = results.find((r) => r.id !== "full" && !r.crashed && !r.error);
  if (fix) {
    console.log(`Fix: remove ${fix.omitted} (${fix.id})`);
  } else {
    console.log("No single high-risk plugin omission fixed OOM yet.");
  }
}

main();
