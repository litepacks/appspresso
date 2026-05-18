import pc from "picocolors";
import { readPackageVersion } from "./version.mjs";

/**
 * @param {{ packageRoot?: string }} [opts]
 */
export function formatVersionBanner(opts = {}) {
  const version = readPackageVersion(opts.packageRoot);
  return `${pc.bold("Appspresso")} ${pc.dim(`v${version}`)}`;
}

export const APPSPRESSO_MOTTO =
  "One package for the backbone of mobile and web apps.";
