#!/usr/bin/env node
/**
 * Ensure an Android emulator is running (local E2E).
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveAndroidTools } from "./android-sdk.mjs";

const tools = resolveAndroidTools();

function fail(msg) {
  console.error(`appspresso-e2e: ${msg}`);
  process.exit(1);
}

if (!tools) {
  fail(
    "Android SDK not found. Install Android Studio, then set ANDROID_HOME or ensure SDK exists at ~/Library/Android/sdk (macOS).",
  );
}

const { sdkRoot, emulator: emulatorBin, adb: adbBin } = tools;

function adbDevices() {
  const r = spawnSync(adbBin, ["devices"], { encoding: "utf8" });
  if (r.status !== 0) return [];
  return (r.stdout || "")
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("*"))
    .map((line) => line.split(/\s+/))
    .filter(([, state]) => state === "device")
    .map(([serial]) => serial);
}

function listAvdsFromIni() {
  const avdDir = join(homedir(), ".android", "avd");
  if (!existsSync(avdDir)) return [];
  return readdirSync(avdDir)
    .filter((f) => f.endsWith(".ini"))
    .map((f) => {
      const ini = readFileSync(join(avdDir, f), "utf8");
      const m = ini.match(/^avd\.name=(.+)$/m);
      return m ? m[1].trim() : f.replace(/\.ini$/, "");
    })
    .filter(Boolean);
}

function listAvds() {
  const r = spawnSync(emulatorBin, ["-list-avds"], { encoding: "utf8" });
  if (r.status === 0) {
    const fromCli = (r.stdout || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (fromCli.length > 0) return fromCli;
  }
  return listAvdsFromIni();
}

export async function ensureAndroidEmulator() {
  process.stderr.write(`appspresso-e2e: Android SDK ${sdkRoot}\n`);

  const booted = adbDevices();
  if (booted.length > 0) {
    process.stderr.write(
      `appspresso-e2e: using adb device ${booted[0]}\n`,
    );
    return booted[0];
  }

  const avds = listAvds();
  if (avds.length === 0) {
    fail(
      "no booted emulator and no AVDs. Android Studio → Device Manager → Create Virtual Device.",
    );
  }

  const avd = avds[0];
  process.stderr.write(`appspresso-e2e: starting emulator ${avd}\n`);
  const child = spawn(
    emulatorBin,
    ["-avd", avd, "-no-snapshot-load", "-no-boot-anim"],
    { detached: true,
      stdio: "ignore" },
  );
  child.unref();

  const deadline = Date.now() + 300_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    const devices = adbDevices();
    if (devices.length > 0) return devices[0];
  }

  fail("emulator failed to boot within 5 minutes");
}
