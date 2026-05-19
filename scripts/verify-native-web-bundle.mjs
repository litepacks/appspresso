#!/usr/bin/env node
/**
 * Ensures `demo/dist` is a complete Capacitor web bundle (CI / before cap sync).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "demo", "dist");
const indexPath = join(distDir, "index.html");

const MIN_DIST_BYTES = 400_000;

function fail(msg) {
  console.error(`appspresso: ${msg}`);
  process.exit(1);
}

if (!existsSync(indexPath)) {
  fail("demo/dist/index.html missing — run `npm run demo:build`.");
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
walk(distDir);

if (total < MIN_DIST_BYTES) {
  fail(
    `demo/dist is too small (${total} bytes < ${MIN_DIST_BYTES}) — bundle incomplete.`,
  );
}

const html = readFileSync(indexPath, "utf8");
const scriptMatch = html.match(/src="(\.\/assets\/[^"]+\.js)"/);
if (!scriptMatch) {
  fail("demo/dist/index.html has no ./assets/*.js entry script.");
}

const entryJs = join(distDir, scriptMatch[1].replace(/^\.\//, ""));
if (!existsSync(entryJs)) {
  fail(`missing entry script ${scriptMatch[1]} (resolved ${entryJs}).`);
}

console.log(
  `demo/dist OK (${Math.round(total / 1024)} KiB, entry ${scriptMatch[1]})`,
);
