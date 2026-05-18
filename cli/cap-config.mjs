import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliDir = dirname(fileURLToPath(import.meta.url));
const appspressoRoot = join(cliDir, "..");
const emitScript = join(appspressoRoot, "scripts/emit-capacitor-config.ts");

function resolveTsxCli() {
  const candidates = [
    join(appspressoRoot, "node_modules/tsx/dist/cli.mjs"),
    join(process.cwd(), "node_modules/tsx/dist/cli.mjs"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * @param {string} cwd
 */
export async function runCapConfig(cwd) {
  const configPath = join(cwd, "appspresso.config.ts");
  if (!existsSync(configPath)) {
    console.error(
      `appspresso cap:config: appspresso.config.ts not found in ${cwd}`,
    );
    process.exit(1);
  }

  const tsxCli = resolveTsxCli();
  const result = tsxCli
    ? spawnSync(process.execPath, [tsxCli, emitScript, cwd], {
        cwd,
        stdio: "inherit",
      })
    : spawnSync("npx", ["--yes", "tsx", emitScript, cwd], {
        cwd,
        stdio: "inherit",
      });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
