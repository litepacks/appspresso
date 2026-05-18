import { findDirWithNpmScript } from "./paths.mjs";
import { runInherit } from "./run-cmd.mjs";

/** CLI subcommands that forward to `npm run <same-name>` after resolving package root. */
export const npmScriptCommands = new Set([
  "build:lib",
  "demo:cap-config",
  "lint",
  "lint:fix",
  "test",
  "test:run",
  "test:coverage",
  "test:coverage:watch",
  "test:integration",
  "test:integration:coverage",
  "test:integration:watch",
]);

/**
 * @param {string} cwd
 * @param {string} scriptName
 * @param {string[]} passthrough appended after `npm run <script> --`
 */
export async function runNpmScriptCommand(cwd, scriptName, passthrough) {
  const root = findDirWithNpmScript(cwd, scriptName);
  if (!root) {
    console.error(
      `appspresso: no package.json script "${scriptName}" found (walking up from ${cwd})`,
    );
    process.exit(1);
  }

  const args =
    passthrough.length > 0
      ? ["run", scriptName, "--", ...passthrough]
      : ["run", scriptName];

  try {
    await runInherit("npm", args, { cwd: root });
  } catch {
    process.exit(1);
  }
}
