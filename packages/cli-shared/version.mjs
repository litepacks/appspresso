import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} [fromDir] package root; defaults to appspresso monorepo root (parent of packages/)
 */
export function readPackageVersion(fromDir) {
  const root = fromDir ?? join(__dirname, "..", "..");
  try {
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    );
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}
