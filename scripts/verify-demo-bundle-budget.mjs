#!/usr/bin/env node
/**
 * Fails CI when demo production JS entry exceeds budget (gzip not required; raw size guard).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distAssets = path.join(root, "demo/dist/assets");

/** Max bytes for the main hashed entry chunk (adjust when intentionally growing the shell). */
const MAX_ENTRY_JS_BYTES = 2_500_000;

if (!fs.existsSync(distAssets)) {
  console.error(
    "verify-demo-bundle-budget: demo/dist/assets missing — run npm run demo:build first",
  );
  process.exit(1);
}

const entries = fs
  .readdirSync(distAssets)
  .filter((n) => /^index-.*\.js$/.test(n));

if (entries.length === 0) {
  console.error("verify-demo-bundle-budget: no index-*.js in demo/dist/assets");
  process.exit(1);
}

let largest = { name: "", bytes: 0 };
for (const name of entries) {
  const bytes = fs.statSync(path.join(distAssets, name)).size;
  if (bytes > largest.bytes) largest = { name, bytes };
}

if (largest.bytes > MAX_ENTRY_JS_BYTES) {
  console.error(
    `verify-demo-bundle-budget: ${largest.name} is ${largest.bytes} bytes (max ${MAX_ENTRY_JS_BYTES})`,
  );
  process.exit(1);
}

console.log(
  `verify-demo-bundle-budget: ok — ${largest.name} ${largest.bytes} bytes`,
);
