import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";

const OFFICIAL_MODULES = [
  "onboarding",
  "auth",
  "settings",
  "notifications",
  "subscriptions",
];

/**
 * @param {string} name
 */
function packageName(name) {
  return `@appspresso/module-${name}`;
}

/**
 * @param {string} cwd
 * @param {string} name
 */
function readManifest(cwd, name) {
  const pkg = packageName(name);
  const local = join(
    cwd,
    "node_modules",
    pkg.replace("@appspresso/", "@appspresso/"),
    "module.manifest.json",
  );
  const inRepo = join(
    cwd,
    "packages",
    `module-${name}`,
    "module.manifest.json",
  );
  const path = existsSync(local) ? local : existsSync(inRepo) ? inRepo : null;
  if (!path) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * @param {string} cwd
 */
function readModulesFile(cwd) {
  const path = join(cwd, "src", "appspresso.modules.ts");
  if (!existsSync(path)) return { path, content: null };
  return { path, content: readFileSync(path, "utf8") };
}

/**
 * @param {string} cwd
 * @param {string} name
 * @param {object} manifest
 */
function ensureModulesFile(cwd, name, manifest) {
  const { path, content } = readModulesFile(cwd);
  const importLine = manifest.importLine ?? `import { ${name}Module } from "${manifest.npm}";`;
  const registerLine =
    manifest.registerLine ?? `${name}Module(),`;

  if (!content) {
    const body = `/**
 * Appspresso app modules (user-facing features).
 * Install: appspresso add <name>
 */
${importLine}

export const modules = [
  ${registerLine}
];
`;
    writeFileSync(path, body, "utf8");
    return;
  }

  let next = content;
  if (!next.includes(manifest.npm)) {
    next = `${importLine}\n${next}`;
  }
  if (!next.includes(registerLine.trim())) {
    next = next.replace(
      /export const modules = \[/,
      `export const modules = [\n  ${registerLine}`,
    );
  }
  writeFileSync(path, next, "utf8");
}

/**
 * @param {string} cwd
 * @param {string} name
 */
function removeFromModulesFile(cwd, name) {
  const { path, content } = readModulesFile(cwd);
  if (!content) return;
  const pkg = packageName(name);
  let next = content
    .split("\n")
    .filter((line) => !line.includes(pkg) && !line.includes(`${name}Module`))
    .join("\n");
  writeFileSync(path, next, "utf8");
}

/**
 * @param {string} cwd
 * @param {string} name
 */
export async function runModuleAdd(cwd, name) {
  if (!OFFICIAL_MODULES.includes(name)) {
    p.log.error(`Unknown module "${name}". Try: ${OFFICIAL_MODULES.join(", ")}`);
    process.exit(1);
  }
  const pkg = packageName(name);
  p.intro(`Add module: ${name}`);
  execSync(`npm install ${pkg}@^0.6.0`, { cwd, stdio: "inherit" });
  const manifest = readManifest(cwd, name);
  if (manifest) {
    ensureModulesFile(cwd, name, manifest);
    const envExample = join(cwd, ".env.example");
    if (manifest.env?.length && existsSync(envExample)) {
      let env = readFileSync(envExample, "utf8");
      for (const key of manifest.env) {
        if (!env.includes(key)) {
          env += `\n# ${name} module\n${key}=\n`;
        }
      }
      writeFileSync(envExample, env, "utf8");
    }
  }
  p.log.success(`Installed ${pkg}`);
  p.log.info("Next steps:");
  p.log.info("1. Pass `modules` to AppspressoHost in main.tsx");
  p.log.info("2. Use createAppspressoBrowserRouter({ modules: createModuleRegistry(modules) })");
  p.log.info("3. Run appspresso module doctor");
}

/**
 * @param {string} cwd
 * @param {string} name
 */
export async function runModuleRemove(cwd, name) {
  const pkg = packageName(name);
  p.intro(`Remove module: ${name}`);
  try {
    execSync(`npm uninstall ${pkg}`, { cwd, stdio: "inherit" });
  } catch {
    p.log.warn(`Package ${pkg} may not be installed`);
  }
  removeFromModulesFile(cwd, name);
  p.log.success(`Removed ${pkg} from package.json`);
  p.log.info("Manually remove module routes from your router if you inlined any.");
}

/**
 * @param {string} cwd
 */
export function runModuleList(cwd) {
  p.intro("Appspresso modules");
  p.log.info(`Official: ${OFFICIAL_MODULES.join(", ")}`);
  const { content } = readModulesFile(cwd);
  if (content) {
    const installed = OFFICIAL_MODULES.filter((n) =>
      content.includes(packageName(n)),
    );
    p.log.success(`Project modules file: src/appspresso.modules.ts`);
    if (installed.length) {
      p.log.info(`Referenced: ${installed.join(", ")}`);
    } else {
      p.log.warn("No @appspresso/module-* imports found yet");
    }
  } else {
    p.log.warn("src/appspresso.modules.ts not found");
  }
}

/**
 * @param {string} cwd
 */
export function runModuleDoctor(cwd) {
  let exit = 0;
  p.intro("Module doctor");
  const { path, content } = readModulesFile(cwd);
  if (!content) {
    p.log.warn("Missing src/appspresso.modules.ts — run appspresso add <module>");
    exit = 1;
  } else {
    p.log.success(`Found ${path}`);
  }
  for (const name of OFFICIAL_MODULES) {
    const pkg = packageName(name);
    const installed = existsSync(join(cwd, "node_modules", pkg));
    if (content?.includes(pkg)) {
      if (!installed) {
        p.log.warn(`${pkg} referenced but not in node_modules`);
        exit = 1;
      } else {
        p.log.success(`${pkg} installed`);
      }
    }
  }
  if (exit) process.exit(exit);
}

/**
 * @param {string} cwd
 * @param {string} name
 */
export function runModuleInfo(cwd, name) {
  const manifest = readManifest(cwd, name);
  if (!manifest) {
    p.log.error(`No manifest for module "${name}"`);
    process.exit(1);
  }
  p.intro(`Module: ${name}`);
  p.log.info(JSON.stringify(manifest, null, 2));
}
