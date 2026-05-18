#!/usr/bin/env node
/**
 * Single visual source: `public/icon.svg` + `public/splash.svg` (same as web).
 * Copies them under `assets/` for @capacitor/assets and generates Android (and iOS if present)
 * icon / splash rasters.
 *
 * Run from project root: `npm run cap:assets`
 */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const demoRoot = join(__dirname, "..");
const assetsDir = join(demoRoot, "assets");

mkdirSync(assetsDir, { recursive: true });
cpSync(join(demoRoot, "public", "icon.svg"), join(assetsDir, "icon.svg"));
cpSync(join(demoRoot, "public", "splash.svg"), join(assetsDir, "splash.svg"));

const result = spawnSync(
  "npx",
  ["--yes", "@capacitor/assets@3.0.5", "generate"],
  { cwd: demoRoot, stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
