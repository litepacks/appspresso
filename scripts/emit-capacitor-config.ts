/**
 * `appspresso.config.ts` → `capacitor.config.json` (defineAppspressoProject output).
 * CLI: `appspresso cap:config` — cwd argument or process.cwd().
 */
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const cwd = resolve(process.argv[2] ?? process.cwd());
const configUrl = pathToFileURL(join(cwd, "appspresso.config.ts")).href;

const mod = await import(configUrl);
if (mod.capacitor == null) {
  throw new Error("appspresso.config.ts must export `capacitor`");
}

const outPath = join(cwd, "capacitor.config.json");
writeFileSync(outPath, `${JSON.stringify(mod.capacitor, null, 2)}\n`);
console.log(`wrote ${outPath}`);
