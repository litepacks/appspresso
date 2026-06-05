import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";

const TARGETS = [
  { rel: "dist", label: "dist/" },
  { rel: "coverage", label: "coverage/" },
  { rel: "coverage-integration", label: "coverage-integration/" },
  { rel: "node_modules/.vite", label: "Vite cache" },
  { rel: "android/app/build", label: "android/app/build/" },
  { rel: "android/.gradle", label: "android/.gradle/" },
];

/**
 * @param {string} cwd
 * @param {{ yes?: boolean }} [opts]
 */
export async function runClean(cwd, opts = {}) {
  const found = TARGETS.filter((t) => existsSync(join(cwd, t.rel)));
  if (found.length === 0) {
    console.log("appspresso clean: nothing to remove");
    return;
  }

  p.intro("Clean build artifacts");

  if (!opts.yes) {
    const ok = await p.confirm({
      message: `Remove ${found.length} path(s)?`,
      initialValue: true,
    });
    if (p.isCancel(ok) || !ok) {
      p.cancel("Cancelled");
      return;
    }
  }

  for (const t of found) {
    rmSync(join(cwd, t.rel), { recursive: true, force: true });
    p.log.success(`Removed ${t.label}`);
  }

  p.outro("Done");
}
