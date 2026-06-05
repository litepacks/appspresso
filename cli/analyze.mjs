import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Max bytes for main hashed entry chunk (keep in sync with scripts/verify-demo-bundle-budget.mjs). */
const MAX_ENTRY_JS_BYTES = 2_500_000;

/**
 * @param {string} cwd
 */
export function runAnalyze(cwd) {
  const distAssets = join(cwd, "dist/assets");
  if (!existsSync(distAssets)) {
    console.error(
      "appspresso analyze: dist/assets missing — run npm run build first",
    );
    process.exit(1);
  }

  const entries = readdirSync(distAssets).filter((n) => /\.(js|css)$/.test(n));

  if (entries.length === 0) {
    console.error("appspresso analyze: no JS/CSS assets in dist/assets");
    process.exit(1);
  }

  const rows = entries
    .map((name) => {
      const bytes = statSync(join(distAssets, name)).size;
      return { name, bytes, kind: name.endsWith(".css") ? "css" : "js" };
    })
    .sort((a, b) => b.bytes - a.bytes);

  console.log("Bundle assets (dist/assets):\n");
  for (const r of rows) {
    const kb = (r.bytes / 1024).toFixed(1);
    console.log(`  ${r.name.padEnd(40)} ${kb.padStart(8)} KB`);
  }

  const mainJs = rows.find(
    (r) => r.kind === "js" && /^index-.*\.js$/.test(r.name),
  );
  if (mainJs) {
    const budgetKb = (MAX_ENTRY_JS_BYTES / 1024).toFixed(0);
    const ok = mainJs.bytes <= MAX_ENTRY_JS_BYTES;
    console.log(
      `\nMain entry ${mainJs.name}: ${(mainJs.bytes / 1024).toFixed(1)} KB (budget ${budgetKb} KB) — ${ok ? "OK" : "OVER"}`,
    );
    if (!ok) process.exit(1);
  }
}
