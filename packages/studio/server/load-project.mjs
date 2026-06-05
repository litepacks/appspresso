import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { register } from "tsx/esm/api";

let tsxReady = false;

function ensureTsx() {
  if (!tsxReady) {
    register();
    tsxReady = true;
  }
}

/**
 * @param {string} cwd
 * @param {string} rel
 */
async function loadTsModule(cwd, rel) {
  const abs = join(cwd, rel);
  if (!existsSync(abs)) return null;
  try {
    ensureTsx();
    const mod = await import(pathToFileURL(abs).href);
    return mod;
  } catch (e) {
    return { __error: String(e) };
  }
}

/**
 * @param {string} cwd
 */
export async function loadProjectConfig(cwd) {
  const files = {
    routes: "appspresso.routes.ts",
    flags: "appspresso.flags.ts",
    theme: "appspresso.theme.ts",
    envSchema: "appspresso.env.schema.ts",
    plugins: "appspresso.plugins.ts",
    config: "appspresso.config.ts",
    envExample: ".env.example",
  };

  /** @type {Record<string, unknown>} */
  const slices = {};
  /** @type {Record<string, boolean>} */
  const present = {};

  for (const [key, rel] of Object.entries(files)) {
    if (key === "envExample") {
      present.envExample = existsSync(join(cwd, rel));
      if (present.envExample) {
        slices.envExampleText = readFileSync(join(cwd, rel), "utf8");
      }
      continue;
    }
    present[key] = existsSync(join(cwd, rel));
    if (!present[key]) continue;
    const mod = await loadTsModule(cwd, rel);
    if (mod?.__error) {
      slices[`${key}Error`] = mod.__error;
      continue;
    }
    if (key === "routes") slices.routes = mod.routes ?? mod.default;
    else if (key === "flags") slices.flags = mod.flags ?? mod.default;
    else if (key === "theme") slices.theme = mod.theme ?? mod.default;
    else if (key === "envSchema") slices.envSchema = mod.envSchema ?? mod.default;
    else if (key === "plugins") slices.plugins = mod.plugins ?? mod.default;
    else if (key === "config") {
      slices.config = {
        app: mod.app,
        capacitor: mod.capacitor,
        hasVite: mod.default != null,
      };
    }
  }

  return { cwd, present, slices };
}

/**
 * @param {string} cwd
 */
export async function loadCapacitorPreview(cwd) {
  const mod = await loadTsModule(cwd, "appspresso.config.ts");
  if (mod?.__error) return { ok: false, error: mod.__error };
  if (mod.capacitor == null) {
    return { ok: false, error: "appspresso.config.ts must export `capacitor`" };
  }
  return { ok: true, capacitor: mod.capacitor, app: mod.app ?? null };
}
