import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";

/**
 * Optionally run `npx cap add` after scaffold when Capacitor is enabled.
 * @param {string} projectDir
 * @param {{ interactive: boolean, findCapacitorCli: (cwd: string) => string | null }} opts
 */
export async function runCapAddWizard(projectDir, opts) {
  if (!opts.interactive) return;
  if (!existsSync(join(projectDir, "package.json"))) return;

  const capCli = opts.findCapacitorCli(projectDir);
  if (!capCli) {
    p.log.info("Skip cap add: @capacitor/cli not installed yet");
    return;
  }

  const hasAndroid = existsSync(join(projectDir, "android"));
  const hasIos = existsSync(join(projectDir, "ios"));

  if (!hasAndroid) {
    const add = await p.confirm({
      message: "Add Android platform now? (npx cap add android)",
      initialValue: true,
    });
    if (!p.isCancel(add) && add) {
      runCapAdd(projectDir, "android");
    }
  }

  if (!hasIos && process.platform === "darwin") {
    const add = await p.confirm({
      message: "Add iOS platform now? (npx cap add ios)",
      initialValue: true,
    });
    if (!p.isCancel(add) && add) {
      runCapAdd(projectDir, "ios");
    }
  } else if (!hasIos) {
    p.log.info("iOS: run on macOS — npx cap add ios");
  }
}

/**
 * @param {string} projectDir
 * @param {"android"|"ios"} platform
 */
function runCapAdd(projectDir, platform) {
  const r = spawnSync("npx", ["cap", "add", platform], {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    p.log.warn(`cap add ${platform} exited with code ${r.status ?? 1}`);
  }
}
