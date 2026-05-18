import type { CapacitorConfig } from "@capacitor/cli";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Capacitor CLI entry. Run `npm run cap:config` (`appspresso cap:config`) first;
 * merged config from `appspresso.config.ts` → `capacitor.config.json`.
 */
const config = JSON.parse(
  readFileSync(join(__dirname, "capacitor.config.json"), "utf8"),
) as CapacitorConfig;

export default config;
