#!/usr/bin/env node
/**
 * After `cap sync`, Android must contain the copied web tree under assets/public.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(
  process.cwd(),
  "demo",
  "android",
  "app",
  "src",
  "main",
  "assets",
  "public",
);

const MIN_BYTES = 400_000;

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

if (!existsSync(join(publicDir, "index.html"))) {
  fail(
    `${publicDir}/index.html missing — run cap sync from demo/ with webDir dist.`,
  );
}

let total = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else total += st.size;
  }
}
walk(publicDir);

if (total < MIN_BYTES) {
  fail(
    `assets/public too small (${total} bytes) — demo/dist was not copied into the APK project.`,
  );
}

console.log(`assets/public OK (${Math.round(total / 1024)} KiB)`);
