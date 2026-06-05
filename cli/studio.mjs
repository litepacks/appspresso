import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { runStudioCheck } from "../packages/studio/server/validate-all.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} cwd
 * @param {{ check?: boolean, json?: boolean, port?: number }} [opts]
 */
export async function runStudio(cwd, opts = {}) {
  if (opts.check) {
    const report = await runStudioCheck(cwd, { json: Boolean(opts.json) });
    if (!report.ok) process.exit(1);
    return;
  }

  const cliStart = join(__dirname, "../packages/studio/server/cli-start.mjs");
  const child = spawn(process.execPath, [cliStart, cwd], {
    stdio: "inherit",
    env: { ...process.env, STUDIO_PORT: String(opts.port ?? 5178) },
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}
