import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findViteCli } from "./paths.mjs";

const subToViteArgs = {
  dev: [],
  build: ["build"],
  preview: ["preview"],
};

/**
 * @param {string} cwd
 * @param {"dev"|"build"|"preview"} sub
 * @param {string[]} passthrough
 */
export function runViteCommand(cwd, sub, passthrough) {
  const viteCli = findViteCli(cwd);
  if (!viteCli) {
    console.error(
      "appspresso: Vite is not installed; add vite as a devDependency.",
    );
    process.exit(1);
  }

  const hasExplicitConfig = passthrough.some(
    (a) => a === "--config" || a.startsWith("--config="),
  );

  const appspressoConfigTs = join(cwd, "appspresso.config.ts");
  const appspressoConfigMts = join(cwd, "appspresso.config.mts");
  const hasAppspressoConfig =
    existsSync(appspressoConfigTs) || existsSync(appspressoConfigMts);
  const appspressoConfigFile = existsSync(appspressoConfigTs)
    ? "appspresso.config.ts"
    : "appspresso.config.mts";

  const viteArgs = [...subToViteArgs[sub], ...passthrough];

  /** Prefer `appspresso.config.ts` when present so `define` (e.g. __APSPRESSO_HOST__) is not lost when a stub `vite.config.*` also exists. */
  if (!hasExplicitConfig && hasAppspressoConfig) {
    viteArgs.unshift("--config", appspressoConfigFile);
  }

  const child = spawn(process.execPath, [viteCli, ...viteArgs], {
    cwd,
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

export { subToViteArgs };
