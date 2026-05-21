#!/usr/bin/env node
/**
 * Merge Capacitor native deps into demo/package.json (Capacitor discovers plugins from app package.json).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const demoPkgPath = join(root, "demo", "package.json");
const capDepsPath = join(root, "scripts", "capacitor-native-deps.json");

const capDeps = JSON.parse(readFileSync(capDepsPath, "utf8"));
const pkg = JSON.parse(readFileSync(demoPkgPath, "utf8"));

pkg.dependencies = { ...capDeps.dependencies, ...pkg.dependencies };
pkg.devDependencies = {
  ...pkg.devDependencies,
  ...capDeps.devDependencies,
};

writeFileSync(demoPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log("demo/package.json: Capacitor native dependencies ensured");
