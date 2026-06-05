import * as p from "@clack/prompts";
import { readAppspressoProjectInfo } from "./project-info.mjs";

/**
 * @param {string} cwd
 * @param {{ map?: boolean }} [opts]
 */
export async function runInfo(cwd, opts = {}) {
  const info = readAppspressoProjectInfo(cwd);

  p.intro("Appspresso project");

  if (info.packageName) p.log.info(`Package: ${info.packageName}`);
  if (info.displayName) p.log.info(`Display name: ${info.displayName}`);
  if (info.appId) p.log.info(`App id: ${info.appId}`);
  if (info.appspressoVersion) {
    p.log.info(`appspresso: ${info.appspressoVersion}`);
  } else {
    p.log.warn("appspresso dependency not found in package.json");
  }

  if (info.hasConfig) p.log.success("appspresso.config.ts");
  else p.log.warn("appspresso.config.ts missing");

  if (info.hasEnv) p.log.success(".env present");
  else if (info.hasEnvExample) {
    p.log.warn(".env missing — run: cp .env.example .env");
  } else {
    p.log.warn(".env missing (no .env.example)");
  }

  if (info.envPresent.length > 0) {
    p.log.info(`Env keys set: ${info.envPresent.join(", ")}`);
  }

  if (info.hasAndroid) p.log.success("android/");
  else p.log.info("android/ — not added");

  if (info.hasIos) p.log.success("ios/");
  else p.log.info("ios/ — not added");

  if (info.hasDist) p.log.info("dist/ — built");

  if (opts.map) {
    p.log.message(`Project map:
  src/main.tsx       — bootAppspressoHost entry
  src/AppRoot.tsx    — router (minimal) or DemoShowcaseApp (showcase)
  appspresso.config.ts — Vite + app meta
  docs/getting-started/ — tutorials`);
  }

  p.outro("Run appspresso doctor for environment checks");
}
