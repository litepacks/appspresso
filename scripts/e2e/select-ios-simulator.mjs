#!/usr/bin/env node
/**
 * Deterministic iOS simulator UDID (stdout only).
 * Override device name: MAESTRO_IOS_DEVICE="iPhone 16"
 */
import { spawnSync } from "node:child_process";

const PREFERRED = ["iPhone 16", "iPhone 15 Pro", "iPhone 15"];
const overrideName = process.env.MAESTRO_IOS_DEVICE?.trim();

const r = spawnSync("xcrun", ["simctl", "list", "devices", "available", "-j"], {
  encoding: "utf8",
});
if (r.status !== 0) {
  process.stderr.write(r.stderr || "simctl list failed\n");
  process.exit(r.status ?? 1);
}

const j = JSON.parse(r.stdout || "{}");
const runtimes = Object.keys(j.devices || {}).filter((k) => k.includes("iOS"));
const devices = runtimes.flatMap((k) => j.devices[k] || []);
const iphones = devices.filter(
  (d) => d.isAvailable !== false && /^iPhone /.test(d.name),
);

if (iphones.length === 0) {
  console.error("appspresso-e2e: no available iPhone simulators");
  process.exit(1);
}

let pick;
if (overrideName) {
  pick = iphones.find((d) => d.name === overrideName);
  if (!pick) {
    console.error(
      `appspresso-e2e: simulator "${overrideName}" not found. Available: ${iphones.map((d) => d.name).join(", ")}`,
    );
    process.exit(1);
  }
} else {
  pick =
    iphones.find((d) => PREFERRED.includes(d.name)) ||
    iphones.sort((a, b) => b.name.localeCompare(a.name))[0];
}

process.stdout.write(pick.udid);
