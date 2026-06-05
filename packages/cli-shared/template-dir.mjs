import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREATE_ROOT = join(__dirname, "..", "create-appspresso");

/** @typedef {"minimal"|"showcase"} ScaffoldTemplate */

/**
 * @param {ScaffoldTemplate | string} name
 * @returns {string}
 */
export function resolveScaffoldTemplateDir(name) {
  const template = name === "showcase" ? "showcase" : "minimal";
  const dir =
    template === "showcase"
      ? join(CREATE_ROOT, "template")
      : join(CREATE_ROOT, "template-minimal");
  if (!existsSync(dir)) {
    throw new Error(
      `Template "${template}" missing at ${dir}. In the monorepo run: npm run create:sync-template`,
    );
  }
  return dir;
}
