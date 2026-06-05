#!/usr/bin/env node
/**
 * Demo native boot — install debug APK, launch, stream readable APSPRESSO_BOOT logcat.
 *
 * Usage:
 *   npm run debug:android:demo              # install + watch (APK must exist)
 *   npm run debug:android:demo -- --build     # rebuild debug APK first
 *   npm run debug:android:demo -- --skip-install
 *
 * Filter in another terminal:
 *   adb logcat | grep APSPRESSO_BOOT
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaultAndroidApk } from "../e2e/paths.mjs";
import { resolveAndroidTools } from "../e2e/android-sdk.mjs";

const APP_ID = "com.example.capacitorvitepoc";
const MAIN = `${APP_ID}/.MainActivity`;
const root = process.cwd();
const apkDefault = defaultAndroidApk;

const args = process.argv.slice(2);
let skipInstall = args.includes("--skip-install");
let doBuild = args.includes("--build");
let apkPath = apkDefault;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--apk" && args[i + 1]) apkPath = args[++i];
}

function fail(msg) {
  console.error(`demo-boot-watch: ${msg}`);
  process.exit(1);
}

const tools = resolveAndroidTools();
if (!tools?.adb) fail("adb bulunamadı — ANDROID_HOME / platform-tools kurulu mu?");

function deviceSerial() {
  const list = spawnSync(tools.adb, ["devices"], { encoding: "utf8" });
  const line = list.stdout
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.endsWith("\tdevice"));
  return line?.split("\t")[0] ?? null;
}

function runAdb(adbcArgs, opts = {}) {
  const r = spawnSync(tools.adb, adbcArgs, {
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.status !== 0 && !opts.allowFail) process.exit(r.status ?? 1);
}

function printGuide() {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Demo native boot izleme (manuel debug)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("Ne oluyor?");
  console.log("  1) Native splash (Capacitor SplashScreen plugin)");
  console.log("  2) WebView index.html + JS yüklenir");
  console.log("  3) APSPRESSO_BOOT satırları = bootstrap adımları (+ms)");
  console.log("  4) phase=ready → ana ekran; deferred +4s → SQLite (native)");
  console.log("");
  console.log("Log satırı formatı:");
  console.log("  APSPRESSO_BOOT +1234ms bootstrap.initAppearance.start | {...}");
  console.log("");
  console.log("Sorun ipuçları:");
  console.log("  • Son satır erken kesildiyse → o adımda takılma / crash");
  console.log("  • V8 javascript OOM → JS heap (bundle), plugin değil tek başına");
  console.log("  • tile memory limits → WebView çok fazla chunk yüklüyor");
  console.log("  • Renderer process crash → genelde OOM sonrası");
  console.log("");
  console.log("Logcat: adb logcat | grep APSPRESSO_BOOT");
  console.log("Ctrl+C ile dur.");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
}

if (doBuild) {
  console.log("==> debug APK build (VITE_NATIVE_DEBUG + VITE_BOOT_TRACE)");
  console.log("    (1–3 dk sürebilir: lib → demo web → gradle — cihaz gerekmez)");
  const started = Date.now();
  const build = spawnSync(
    "npm",
    ["run", "ci:native:android:debug"],
    {
      cwd: root,
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        VITE_NATIVE_DEBUG: "true",
        VITE_BOOT_TRACE: "true",
      },
    },
  );
  console.log(
    `==> build bitti (${Math.round((Date.now() - started) / 1000)}s, exit ${build.status ?? "?"})`,
  );
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const serial = deviceSerial();
if (!serial) {
  fail(
    "adb cihaz yok — USB bağla veya emulator aç, sonra tekrar dene (build --build ile alındıysa --skip-install kullanma)",
  );
}
console.log(`==> cihaz: ${serial}`);

runAdb(["wait-for-device"]);

if (!skipInstall) {
  if (!existsSync(apkPath)) {
    fail(`APK yok: ${apkPath}\n  Önce: npm run debug:android:demo -- --build`);
  }
  console.log(`==> APK kuruluyor: ${apkPath}`);
  runAdb(["install", "-r", apkPath]);
}

console.log("==> logcat temizleniyor");
runAdb(["logcat", "-c"]);

console.log(`==> uygulama açılıyor: ${MAIN}`);
runAdb([
  "shell",
  "am",
  "force-stop",
  APP_ID,
]);
runAdb([
  "shell",
  "am",
  "start",
  "-n",
  MAIN,
  "-a",
  "android.intent.action.MAIN",
  "-c",
  "android.intent.category.LAUNCHER",
]);

printGuide();

const patterns = [
  /APSPRESSO_BOOT/,
  /V8 javascript OOM/i,
  /Renderer process.*crash/i,
  /tile memory limits exceeded/i,
  /FATAL EXCEPTION/,
  /AndroidRuntime/,
  /Capacitor\/Console/,
  /chromium.*ERROR/,
];

const child = spawn(tools.adb, ["logcat"], { stdio: ["ignore", "pipe", "inherit"] });

child.stdout.on("data", (chunk) => {
  for (const line of chunk.toString().split("\n")) {
    if (!line.trim()) continue;
    if (patterns.some((p) => p.test(line))) {
      process.stdout.write(`${line}\n`);
      if (/V8 javascript OOM/i.test(line)) {
        process.stdout.write(
          "\n>>> OOM tespit edildi — JS bellek limiti. Son APSPRESSO_BOOT satırına bak.\n\n",
        );
      }
    }
  }
});

child.on("close", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
