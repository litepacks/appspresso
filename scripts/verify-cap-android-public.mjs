#!/usr/bin/env node
/**
 * After `cap sync`, Android must contain the copied web tree under assets/public.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

const indexHtml = join(publicDir, "index.html");
const html = readFileSync(indexHtml, "utf8");
const scriptMatch = html.match(/src="(\.\/assets\/[^"]+\.js)"/);
if (!scriptMatch) {
  fail("assets/public/index.html has no ./assets/*.js entry script.");
}
const entryJs = join(publicDir, scriptMatch[1].replace(/^\.\//, ""));
if (!existsSync(entryJs)) {
  fail(`assets/public missing bundled entry ${scriptMatch[1]}`);
}
const entrySize = statSync(entryJs).size;
if (entrySize < 200_000) {
  fail(
    `assets/public entry script too small (${entrySize} bytes) — JS bundle not copied.`,
  );
}

console.log(
  `assets/public OK (${Math.round(total / 1024)} KiB, entry ${Math.round(entrySize / 1024)} KiB)`,
);
