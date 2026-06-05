#!/usr/bin/env node
/**
 * Run Maestro flows (shared CI/local entrypoint).
 *
 *   node scripts/e2e/maestro.mjs --platform android|ios [--device UDID] [--flow path]
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { flowsShared, maestroRoot } from "./paths.mjs";

function parseArgs(argv) {
  let platform;
  let device;
  let flow;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--platform" && argv[i + 1]) {
      platform = argv[++i];
    } else if (a === "--device" && argv[i + 1]) {
      device = argv[++i];
    } else if (a === "--flow" && argv[i + 1]) {
      flow = argv[++i];
    }
  }
  return { platform, device, flow };
}

function findMaestro() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const candidates = [
    "maestro",
    home ? `${home}/.maestro/bin/maestro` : null,
  ].filter(Boolean);
  for (const c of candidates) {
    const r = spawnSync(c, ["--version"], { encoding: "utf8" });
    if (r.status === 0) return c;
  }
  console.error(
    "appspresso-e2e: Maestro CLI not found. Install: https://docs.maestro.dev/getting-started/installing-maestro",
  );
  process.exit(1);
}

const { platform, device, flow } = parseArgs(process.argv);
const target = flow ?? flowsShared;

if (!existsSync(target)) {
  console.error(`appspresso-e2e: flow path missing: ${target}`);
  process.exit(1);
}

const maestro = findMaestro();
const args = [];
if (device) {
  args.push("--device", device);
}
args.push("test", target);

process.stderr.write(
  `appspresso-e2e: ${maestro} ${args.join(" ")} (config ${maestroRoot})\n`,
);

const env = {
  ...process.env,
  MAESTRO_CLI_NO_ANALYTICS: process.env.MAESTRO_CLI_NO_ANALYTICS ?? "1",
};

const r = spawnSync(maestro, args, {
  cwd: maestroRoot,
  stdio: "inherit",
  env,
});
process.exit(r.status ?? 1);
