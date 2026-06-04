#!/usr/bin/env node
/**
 * Ensures Maestro `appId` matches demo `appspresso.config.ts` native app id.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maestroConfig = path.join(root, "e2e/maestro/config.yaml");
const demoConfig = path.join(root, "demo/appspresso.config.ts");

const yaml = fs.readFileSync(maestroConfig, "utf8");
const maestroMatch = yaml.match(/^appId:\s*(\S+)/m);
if (!maestroMatch) {
  console.error(
    "verify-maestro-app-id: appId not found in e2e/maestro/config.yaml",
  );
  process.exit(1);
}
const maestroAppId = maestroMatch[1];

const demoSrc = fs.readFileSync(demoConfig, "utf8");
const demoMatch = demoSrc.match(/\bid:\s*"([^"]+)"/);
if (!demoMatch) {
  console.error(
    "verify-maestro-app-id: app.id not found in demo/appspresso.config.ts",
  );
  process.exit(1);
}
const demoAppId = demoMatch[1];

if (maestroAppId !== demoAppId) {
  console.error(
    `verify-maestro-app-id: mismatch — Maestro=${maestroAppId} demo=${demoAppId}`,
  );
  process.exit(1);
}

console.log(`verify-maestro-app-id: ok (${maestroAppId})`);
