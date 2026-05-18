import { spawn } from "node:child_process";

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string; shell?: boolean; env?: NodeJS.ProcessEnv }} [options]
 * @returns {Promise<void>}
 */
export function runInherit(command, args, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const shell =
    options.shell ??
    (process.platform === "win32" && /^npm(\.cmd)?$/i.test(command));
  const env =
    options.env != null ? { ...process.env, ...options.env } : process.env;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }
      if (code === 0) resolve();
      else reject(new Error(`"${command}" exited with code ${code}`));
    });
  });
}
