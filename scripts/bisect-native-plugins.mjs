#!/usr/bin/env node
/**
 * Add each demo Capacitor plugin to native-blank one at a time and detect OOM/crash.
 *
 * Usage: node scripts/bisect-native-plugins.mjs [--wait-ms=55000] [--serial=RFCY...]
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appRoot = join(root, "examples", "native-blank");
const androidDir = join(appRoot, "android");
const apkPath = join(
  androidDir,
  "app/build/outputs/apk/debug/app-debug.apk",
);
const reportPath = join(root, "examples/native-blank/plugin-bisect-report.json");

const waitArg = process.argv.find((a) => a.startsWith("--wait-ms="));
const waitMs = waitArg ? Number(waitArg.split("=")[1]) : 55_000;
const serialArg = process.argv.find((a) => a.startsWith("--serial="));
const pkg = "com.example.appspresso.blank";

const capDeps = JSON.parse(
  readFileSync(join(root, "scripts/capacitor-native-deps.json"), "utf8"),
).dependencies;

/** Demo plugins beyond blank baseline (app + splash-screen). */
const PROBES = [
  {
    id: "baseline",
    label: "baseline (app + splash only)",
    deps: {},
    probeJs: "",
  },
  {
    id: "sqlite",
    label: "@capacitor-community/sqlite",
    deps: { "@capacitor-community/sqlite": capDeps["@capacitor-community/sqlite"] },
    probeJs: `import "@capacitor-community/sqlite";`,
  },
  {
    id: "action-sheet",
    label: "@capacitor/action-sheet",
    deps: { "@capacitor/action-sheet": capDeps["@capacitor/action-sheet"] },
    probeJs: `import "@capacitor/action-sheet";`,
  },
  {
    id: "device",
    label: "@capacitor/device",
    deps: { "@capacitor/device": capDeps["@capacitor/device"] },
    probeJs: `import "@capacitor/device";`,
  },
  {
    id: "dialog",
    label: "@capacitor/dialog",
    deps: { "@capacitor/dialog": capDeps["@capacitor/dialog"] },
    probeJs: `import "@capacitor/dialog";`,
  },
  {
    id: "filesystem",
    label: "@capacitor/filesystem",
    deps: { "@capacitor/filesystem": capDeps["@capacitor/filesystem"] },
    probeJs: `import "@capacitor/filesystem";`,
  },
  {
    id: "inappbrowser",
    label: "@capacitor/inappbrowser",
    deps: { "@capacitor/inappbrowser": capDeps["@capacitor/inappbrowser"] },
    probeJs: `import "@capacitor/inappbrowser";`,
  },
  {
    id: "keyboard",
    label: "@capacitor/keyboard",
    deps: { "@capacitor/keyboard": capDeps["@capacitor/keyboard"] },
    probeJs: `import "@capacitor/keyboard";`,
  },
  {
    id: "network",
    label: "@capacitor/network",
    deps: { "@capacitor/network": capDeps["@capacitor/network"] },
    probeJs: `import "@capacitor/network";`,
  },
  {
    id: "share",
    label: "@capacitor/share",
    deps: { "@capacitor/share": capDeps["@capacitor/share"] },
    probeJs: `import "@capacitor/share";`,
  },
  {
    id: "status-bar",
    label: "@capacitor/status-bar",
    deps: { "@capacitor/status-bar": capDeps["@capacitor/status-bar"] },
    probeJs: `import "@capacitor/status-bar";`,
  },
];

const BASE_PKG = {
  name: "appspresso-native-blank",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    "cap:sync": "cap sync",
    "cap:sync:android": "cap sync android",
  },
  dependencies: {
    "@capacitor/android": capDeps["@capacitor/android"],
    "@capacitor/app": capDeps["@capacitor/app"],
    "@capacitor/core": capDeps["@capacitor/core"],
    "@capacitor/splash-screen": capDeps["@capacitor/splash-screen"],
  },
  devDependencies: {
    "@capacitor/cli": capDeps["@capacitor/cli"] ?? "^7.4.4",
  },
};

const MAIN_TEMPLATE = readFileSync(
  join(appRoot, "src/main.ts"),
  "utf8",
);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed (${r.status})`);
  }
}

function runCapture(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: "utf8",
    shell: false,
    ...opts,
  });
}

function findCapCli() {
  const cap = join(root, "node_modules", "@capacitor", "cli", "bin", "capacitor");
  if (!existsSync(cap)) throw new Error("@capacitor/cli missing");
  return cap;
}

function adbArgs() {
  const serial = serialArg?.split("=")[1] ?? detectDevice();
  return serial ? ["-s", serial] : [];
}

function detectDevice() {
  const list = runCapture("adb", ["devices"]);
  const line = list.stdout
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.endsWith("\tdevice"));
  return line?.split("\t")[0] ?? null;
}

function writePackage(extraDeps) {
  const pkgJson = {
    ...BASE_PKG,
    dependencies: { ...BASE_PKG.dependencies, ...extraDeps },
  };
  writeFileSync(
    join(appRoot, "package.json"),
    `${JSON.stringify(pkgJson, null, 2)}\n`,
  );
}

function writeMain(probeJs) {
  const marker = "// __PLUGIN_PROBE__";
  const base = MAIN_TEMPLATE.includes(marker)
    ? MAIN_TEMPLATE.split(marker)[0].trimEnd()
    : MAIN_TEMPLATE.trimEnd();
  const body = probeJs
    ? `${base}\n\n${marker}\n${probeJs}\n`
    : `${base}\n`;
  writeFileSync(join(appRoot, "src/main.ts"), body);
}

function buildAndSync() {
  run("npm", ["install"], { cwd: root });
  run("npm", ["run", "build"], { cwd: appRoot });
  const capCli = findCapCli();
  run(process.execPath, [capCli, "sync", "android"], { cwd: appRoot });
  const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  run(gradle, ["assembleDebug"], { cwd: androidDir });
  if (!existsSync(apkPath)) throw new Error(`APK missing: ${apkPath}`);
}

function launchAndProbe() {
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
  const alive = Boolean(pid.stdout?.trim());

  const log = runCapture("adb", [...adb, "logcat", "-d", "-t", "400"]);
  const text = log.stdout ?? "";
  const oom = /V8 javascript OOM/i.test(text);
  const rendererCrash = /Renderer process.*crash/i.test(text);
  const tileMem = /tile memory limits exceeded/i.test(text);

  return {
    alive,
    pid: pid.stdout?.trim() || null,
    oom,
    rendererCrash,
    tileMem,
    crashed: !alive || oom || rendererCrash,
  };
}

function main() {
  if (!detectDevice() && !serialArg) {
    console.error("bisect: no adb device");
    process.exit(1);
  }
  if (!existsSync(join(androidDir, "gradlew"))) {
    console.error("bisect: run npm run ci:native:android:blank first");
    process.exit(1);
  }

  mkdirSync(join(appRoot, "src"), { recursive: true });
  const results = [];

  for (const probe of PROBES) {
    console.log(`\n========== ${probe.id}: ${probe.label} ==========`);
    try {
      writePackage(probe.deps);
      writeMain(probe.probeJs);
      buildAndSync();
      const stats = launchAndProbe();
      const entry = {
        id: probe.id,
        label: probe.label,
        deps: Object.keys(probe.deps),
        ...stats,
        at: new Date().toISOString(),
      };
      results.push(entry);
      console.log(
        JSON.stringify(
          { id: probe.id, crashed: entry.crashed, oom: entry.oom, alive: entry.alive },
          null,
          2,
        ),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        id: probe.id,
        label: probe.label,
        error: msg,
        crashed: true,
        at: new Date().toISOString(),
      });
      console.error(`FAILED ${probe.id}: ${msg}`);
    }
  }

  writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
  writeMain("");
  writePackage({});

  console.log(`\nReport: ${reportPath}`);
  const bad = results.filter((r) => r.crashed && !r.error);
  const firstOom = results.find((r) => r.oom);
  if (firstOom) {
    console.log(`First OOM with plugin probe: ${firstOom.id} (${firstOom.label})`);
  } else if (bad.length === 0) {
    console.log(
      "No single plugin reproduced OOM in isolation — likely JS bundle / combo issue.",
    );
  }
}

main();
