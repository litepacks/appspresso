import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { placeholderMap } from "./manifest.mjs";

const TEXT_EXT = /\.(html?|tsx?|jsx?|css|json|md|mjs|cjs|ya?ml)$/i;

function walkFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function applyPlaceholders(content, map) {
  let s = content;
  for (const [token, val] of Object.entries(map)) {
    if (!s.includes(token)) continue;
    s = s.split(token).join(val);
  }
  return s;
}

/**
 * @param {string} projectDir
 * @param {import("./manifest.mjs").InitManifest} manifest
 */
export function applyPathRemap(projectDir, manifest) {
  const { src, public: pub } = manifest.paths;
  if (src !== "src" && existsSync(join(projectDir, "src"))) {
    const dest = join(projectDir, src);
    if (existsSync(dest)) {
      throw new Error(`Cannot remap src → ${src}: "${dest}" already exists`);
    }
    renameSync(join(projectDir, "src"), dest);
  }
  if (pub !== "public" && existsSync(join(projectDir, "public"))) {
    const dest = join(projectDir, pub);
    if (existsSync(dest)) {
      throw new Error(`Cannot remap public → ${pub}: "${dest}" already exists`);
    }
    renameSync(join(projectDir, "public"), dest);
  }
  if (manifest.paths.config !== "appspresso.config.ts") {
    const from = join(projectDir, "appspresso.config.ts");
    const to = join(projectDir, manifest.paths.config);
    if (existsSync(from) && !existsSync(to)) {
      renameSync(from, to);
    }
  }
}

/**
 * @param {string} projectDir
 * @param {import("./manifest.mjs").InitManifest} manifest
 */
export function applyCapacitorLayer(projectDir, manifest) {
  const pkgPath = join(projectDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const capDepsPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../../scripts/capacitor-native-deps.json",
  );
  const capDeps = JSON.parse(readFileSync(capDepsPath, "utf8"));
  pkg.dependencies = { ...capDeps.dependencies, ...pkg.dependencies };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    ...capDeps.devDependencies,
  };
  pkg.scripts = {
    ...pkg.scripts,
    "cap:config": "appspresso cap:config",
    "cap:sync": "appspresso native sync",
    "cap:open:android": "appspresso native open android",
    "cap:open:ios": "appspresso native open ios",
  };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const readMe = join(projectDir, "README.md");
  const hybrid = `

## Hybrid (Capacitor)

Native settings live in \`${manifest.paths.config}\` only. \`npm run cap:sync\` emits \`capacitor.config.json\` and runs \`cap sync\`.

After install:

\`\`\`bash
npx cap add android
npx cap add ios
npm run cap:sync
\`\`\`

Use \`appspresso doctor\` in the app repo for a quick environment check.
`;
  writeFileSync(readMe, readFileSync(readMe, "utf8") + hybrid);
}

/**
 * @param {string} projectDir
 */
export function appendWebOnlyNote(projectDir) {
  const readMe = join(projectDir, "README.md");
  const note = `

## Web-first

Created as web-first. Add native shells later with Capacitor (\`npx cap init\`) and \`appspresso native sync\` when you need Android/iOS.
`;
  writeFileSync(readMe, readFileSync(readMe, "utf8") + note);
}

/**
 * @param {object} opts
 * @param {string} opts.templateDir
 * @param {string} opts.projectDir
 * @param {import("./manifest.mjs").InitManifest} opts.manifest
 */
export function runScaffold({ templateDir, projectDir, manifest }) {
  if (!existsSync(templateDir)) {
    throw new Error(
      "Template folder missing. If developing in the monorepo, run: npm run create:sync-template",
    );
  }

  cpSync(templateDir, projectDir, { recursive: true });
  const map = placeholderMap(manifest);

  for (const file of walkFiles(projectDir)) {
    const rel = file.slice(projectDir.length + 1);
    if (rel === "package-lock.json") continue;
    if (!TEXT_EXT.test(rel)) continue;
    const raw = readFileSync(file, "utf8");
    const next = applyPlaceholders(raw, map);
    if (next !== raw) writeFileSync(file, next);
  }

  applyPathRemap(projectDir, manifest);

  if (manifest.capacitor) {
    applyCapacitorLayer(projectDir, manifest);
  } else {
    appendWebOnlyNote(projectDir);
  }
}

/**
 * @param {string} projectDir
 */
export function runNpmInstall(projectDir) {
  const r = spawnSync("npm", ["install"], {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

/**
 * @param {string} projectDir
 * @param {import("./manifest.mjs").InitManifest} manifest
 */
export function ensureProjectDir(projectDir) {
  if (existsSync(projectDir)) {
    const entries = readdirSync(projectDir);
    if (entries.length > 0) {
      throw new Error(`Target directory is not empty: ${projectDir}`);
    }
  } else {
    mkdirSync(projectDir, { recursive: true });
  }
}
