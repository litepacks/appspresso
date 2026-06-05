import { createJiti } from "jiti";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCapacitorPreview, loadProjectConfig } from "./load-project.mjs";
import { checkSecretLeaks } from "./secret-guard.mjs";

const studioPkgRoot = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(studioPkgRoot, "../../..");

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function loadStudioModule() {
  const candidates = [
    join(monorepoRoot, "dist-lib/studio.js"),
    join(process.cwd(), "node_modules/appspresso/dist-lib/studio.js"),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const jiti = createJiti(import.meta.url, { interopDefault: true });
    return jiti(p);
  }
  throw new Error(
    "appspresso/studio not found — run `npm run build:lib` in the monorepo root",
  );
}

/**
 * @param {string} cwd
 * @param {{ json?: boolean }} [opts]
 */
export async function runStudioCheck(cwd, opts = {}) {
  const studio = await loadStudioModule();
  const project = await loadProjectConfig(cwd);
  /** @type {Array<{ domain: string, ok: boolean, issues: Array<{ path?: string, message: string }> }>} */
  const domains = [];

  if (project.present.routes) {
    const r = studio.validateAppspressoRoutes(project.slices.routes);
    domains.push({
      domain: "routes",
      ok: r.ok,
      issues: r.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  } else {
    domains.push({
      domain: "routes",
      ok: false,
      issues: [{ message: "Missing appspresso.routes.ts" }],
    });
  }

  if (project.present.flags) {
    const parsed = studio.appspressoFlagsSchema.safeParse(project.slices.flags);
    domains.push({
      domain: "flags",
      ok: parsed.success,
      issues: parsed.success
        ? []
        : parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
    });
  } else {
    domains.push({
      domain: "flags",
      ok: false,
      issues: [{ message: "Missing appspresso.flags.ts" }],
    });
  }

  if (project.present.theme) {
    const parsed = studio.appspressoThemeSchema.safeParse(project.slices.theme);
    domains.push({
      domain: "theme",
      ok: parsed.success,
      issues: parsed.success
        ? []
        : parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
    });
  } else {
    domains.push({
      domain: "theme",
      ok: false,
      issues: [{ message: "Missing appspresso.theme.ts" }],
    });
  }

  if (project.present.envSchema) {
    const parsed = studio.appspressoEnvSchema.safeParse(project.slices.envSchema);
    /** @type {Array<{ path?: string, message: string }>} */
    const issues = parsed.success
      ? []
      : parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));

    if (parsed.success && project.present.envExample) {
      const exampleText = String(project.slices.envExampleText ?? "");
      const exampleKeys = new Set(
        exampleText
          .split("\n")
          .map((l) => l.match(/^([A-Z0-9_]+)=/)?.[1])
          .filter(Boolean),
      );
      for (const v of parsed.data.variables) {
        if (!exampleKeys.has(v.key)) {
          issues.push({
            path: v.key,
            message: `Missing ${v.key} in .env.example`,
          });
        }
      }
    } else if (parsed.success && !project.present.envExample) {
      issues.push({ message: "Missing .env.example" });
    }

    domains.push({
      domain: "env",
      ok: issues.length === 0,
      issues,
    });
  } else {
    domains.push({
      domain: "env",
      ok: false,
      issues: [{ message: "Missing appspresso.env.schema.ts" }],
    });
  }

  if (project.present.plugins) {
    const plugins = project.slices.plugins;
    const ok = Array.isArray(plugins);
    domains.push({
      domain: "plugins",
      ok,
      issues: ok
        ? []
        : [{ message: "appspresso.plugins.ts must export `plugins` array" }],
    });
  } else {
    domains.push({
      domain: "plugins",
      ok: false,
      issues: [{ message: "Missing appspresso.plugins.ts" }],
    });
  }

  if (project.present.config) {
    /** @type {Array<{ path?: string, message: string }>} */
    const issues = [];
    if (project.slices.configError) {
      issues.push({ message: String(project.slices.configError) });
    } else {
      const app = project.slices.config?.app;
      if (app) {
        const meta = studio.validateAppspressoAppMeta(app);
        if (!meta.ok) issues.push({ message: meta.error });
      }
      const cap = await loadCapacitorPreview(cwd);
      if (!cap.ok) issues.push({ message: cap.error ?? "capacitor export invalid" });
    }
    domains.push({
      domain: "capacitor",
      ok: issues.length === 0,
      issues,
    });
  } else {
    domains.push({
      domain: "capacitor",
      ok: false,
      issues: [{ message: "Missing appspresso.config.ts" }],
    });
  }

  const secrets = checkSecretLeaks(cwd);
  domains.push({
    domain: "secrets",
    ok: secrets.ok,
    issues: secrets.issues.map((i) => ({
      path: i.file,
      message: i.message,
    })),
  });

  const ok = domains.every((d) => d.ok);
  const report = { ok, cwd, domains };

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Appspresso Studio check — ${cwd}\n`);
    for (const d of domains) {
      console.log(`${d.ok ? "✓" : "✗"} ${d.domain}`);
      for (const issue of d.issues) {
        const prefix = issue.path ? `${issue.path}: ` : "";
        console.log(`    ${prefix}${issue.message}`);
      }
    }
    console.log(`\n${ok ? "All checks passed." : "Check failed."}`);
  }

  return report;
}
