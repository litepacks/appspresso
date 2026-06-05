import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderDefineFile } from "./format-ts.mjs";

const ALLOWLIST = new Set([
  "appspresso.routes.ts",
  "appspresso.flags.ts",
  "appspresso.theme.ts",
  "appspresso.env.schema.ts",
  "appspresso.plugins.ts",
  "appspresso.config.ts",
  ".env.example",
]);

/**
 * @param {string} cwd
 * @param {string} filename
 * @param {string} content
 */
export function writeAllowlisted(cwd, filename, content) {
  if (!ALLOWLIST.has(filename)) {
    throw new Error(`Studio write blocked: ${filename} is not allowlisted`);
  }
  const path = join(cwd, filename);
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  return path;
}

/**
 * @param {string} cwd
 * @param {Record<string, unknown>} payload
 */
export function writeStudioSlices(cwd, payload) {
  /** @type {Array<{ file: string, path: string }>} */
  const written = [];

  if (payload.routes != null) {
    const content = renderDefineFile(
      'import { defineAppspressoRoutes } from "appspresso/studio";',
      "defineAppspressoRoutes",
      "routes",
      payload.routes,
    );
    written.push({
      file: "appspresso.routes.ts",
      path: writeAllowlisted(cwd, "appspresso.routes.ts", content),
    });
  }

  if (payload.flags != null) {
    const content = renderDefineFile(
      'import { defineAppspressoFlags } from "appspresso/studio";',
      "defineAppspressoFlags",
      "flags",
      payload.flags,
    );
    written.push({
      file: "appspresso.flags.ts",
      path: writeAllowlisted(cwd, "appspresso.flags.ts", content),
    });
  }

  if (payload.theme != null) {
    const content = renderDefineFile(
      'import { defineAppspressoTheme } from "appspresso/studio";',
      "defineAppspressoTheme",
      "theme",
      payload.theme,
    );
    written.push({
      file: "appspresso.theme.ts",
      path: writeAllowlisted(cwd, "appspresso.theme.ts", content),
    });
  }

  if (payload.envSchema != null) {
    const content = renderDefineFile(
      'import { defineAppspressoEnvSchema } from "appspresso/studio";',
      "defineAppspressoEnvSchema",
      "envSchema",
      payload.envSchema,
    );
    written.push({
      file: "appspresso.env.schema.ts",
      path: writeAllowlisted(cwd, "appspresso.env.schema.ts", content),
    });
  }

  if (payload.envExampleText != null) {
    written.push({
      file: ".env.example",
      path: writeAllowlisted(cwd, ".env.example", String(payload.envExampleText)),
    });
  }

  return written;
}

export { ALLOWLIST };
