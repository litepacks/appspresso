import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyCapacitorLayer, appendWebOnlyNote } from "./scaffold.mjs";

const APPSPRESSO_SCRIPTS = {
  dev: "appspresso dev",
  build: "appspresso build",
  preview: "appspresso preview",
  "cap:config": "appspresso cap:config",
};

/**
 * @param {Record<string, string>} scripts
 * @param {Record<string, string>} toAdd
 * @param {boolean} force
 */
function mergeScripts(scripts, toAdd, force) {
  for (const [key, val] of Object.entries(toAdd)) {
    if (scripts[key] === undefined) {
      scripts[key] = val;
    } else if (scripts[key] !== val && force) {
      scripts[key] = val;
    }
  }
  return scripts;
}

/**
 * @param {import("./manifest.mjs").InitManifest} manifest
 */
export function minimalConfigSource(manifest) {
  return `import { defineAppspressoProject } from "appspresso/build/project-config";

const { vite } = defineAppspressoProject({
  app: {
    id: ${JSON.stringify(manifest.appId)},
    displayName: ${JSON.stringify(manifest.displayName)},
    version: ${JSON.stringify(manifest.version)},
  },
});

export default vite;
`;
}

/**
 * @param {object} opts
 * @param {string} opts.projectDir
 * @param {import("./manifest.mjs").InitManifest} manifest
 * @param {boolean} opts.force
 */
export function runIntegrate({ projectDir, manifest, force }) {
  const pkgPath = join(projectDir, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`No package.json in ${projectDir}`);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = manifest.packageName;
  pkg.dependencies = {
    ...pkg.dependencies,
    appspresso: manifest.appspressoVersion,
  };
  pkg.scripts = mergeScripts(pkg.scripts ?? {}, APPSPRESSO_SCRIPTS, force);
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const configPath = join(projectDir, manifest.paths.config);
  if (existsSync(configPath) && !force) {
    throw new Error(
      `${manifest.paths.config} already exists. Use --force to overwrite.`,
    );
  }
  writeFileSync(configPath, minimalConfigSource(manifest));

  if (manifest.capacitor) {
    applyCapacitorLayer(projectDir, manifest);
  } else {
    const readMe = join(projectDir, "README.md");
    if (existsSync(readMe)) {
      appendWebOnlyNote(projectDir);
    }
  }
}
