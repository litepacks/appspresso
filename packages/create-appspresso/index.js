#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "template");

const TEXT_EXT = /\.(html?|tsx?|jsx?|css|json|md|mjs|cjs|ya?ml)$/i;

function usage() {
  console.error(`Usage:
  npm create appspresso@latest <project-directory> [options]

Options:
  --appspresso <range>   appspresso semver range (default: ^0.0.0)
  --with-capacitor       add Capacitor config, native deps, and cap npm scripts
  --web-only             mark README as web-first (conflicts with --with-capacitor)
  --skip-install         do not run npm install
  -h, --help             show help

Examples:
  npm create appspresso@latest my-app
  npm create appspresso@latest my-app -- --with-capacitor
  npm create appspresso@latest my-app -- --web-only
  npm create appspresso@latest my-app -- --appspresso ^1.0.0
  npm create ./packages/create-appspresso my-app -- --appspresso file:../app-kit
`);
}

function parseArgs(argv) {
  const args = [...argv];
  let appspresso = "^0.0.0";
  let skipInstall = false;
  let withCapacitor = false;
  let webOnly = false;
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") return { help: true };
    if (a === "--skip-install") {
      skipInstall = true;
      continue;
    }
    if (a === "--with-capacitor" || a === "--hybrid") {
      withCapacitor = true;
      continue;
    }
    if (a === "--web-only") {
      webOnly = true;
      continue;
    }
    if (a === "--appspresso") {
      appspresso = args[++i] ?? "";
      if (!appspresso) throw new Error("--appspresso needs a value");
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    positional.push(a);
  }
  return { positional, appspresso, skipInstall, withCapacitor, webOnly };
}

function assertNpmPackageName(name) {
  if (!/^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) {
    throw new Error(
      `Invalid package name "${name}". Use lowercase letters, numbers, hyphen (optional scoped @scope/pkg).`,
    );
  }
}

function toDisplayName(kebab) {
  return kebab
    .replace(/^@[^/]+\//, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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
  for (const [key, val] of Object.entries(map)) {
    const token = key;
    if (!s.includes(token)) continue;
    s = s.split(token).join(val);
  }
  return s;
}

function applyCapacitorLayer(projectDir) {
  const pkgPath = join(projectDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.dependencies = {
    ...pkg.dependencies,
    "@capacitor/core": "^7.0.0",
    "@capacitor/cli": "^7.4.4",
    "@capacitor/android": "^7.4.4",
    "@capacitor/ios": "^7.4.4",
    "@capacitor/action-sheet": "^7.0.4",
    "@capacitor/dialog": "^7.0.4",
  };
  pkg.scripts = {
    ...pkg.scripts,
    "cap:config": "appspresso cap:config",
    "cap:sync": "npm run cap:config && appspresso native sync",
    "cap:open:android": "appspresso native open android",
    "cap:open:ios": "appspresso native open ios",
  };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  const cap = `import type { CapacitorConfig } from "@capacitor/cli";
import { capacitor } from "./appspresso.config";

/** Edit appspresso.config.ts; run \`npm run cap:config\` to refresh capacitor.config.json. */
export default capacitor satisfies CapacitorConfig;
`;
  if (!existsSync(join(projectDir, "capacitor.config.ts"))) {
    writeFileSync(join(projectDir, "capacitor.config.ts"), cap);
  }
  const readMe = join(projectDir, "README.md");
  const hybrid = `

## Hybrid (Capacitor)

This project was scaffolded with \`--with-capacitor\`. After install:

\`\`\`bash
npx cap add android
npx cap add ios
npm run cap:sync
\`\`\`

Use \`appspresso doctor\` in the app repo for a quick environment check.
`;
  writeFileSync(readMe, readFileSync(readMe, "utf8") + hybrid);
}

function appendWebOnlyNote(projectDir) {
  const readMe = join(projectDir, "README.md");
  const note = `

## Web-first

Created with \`--web-only\`. Add native shells later with Capacitor (\`npx cap init\`) and \`appspresso native sync\` when you need Android/iOS.
`;
  writeFileSync(readMe, readFileSync(readMe, "utf8") + note);
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if ("help" in parsed && parsed.help) {
    usage();
    process.exit(0);
  }
  const { positional, appspresso, skipInstall, withCapacitor, webOnly } =
    parsed;
  const projectDirArg = positional[0];
  if (!projectDirArg) {
    usage();
    process.exit(1);
  }

  if (withCapacitor && webOnly) {
    throw new Error("Use either --with-capacitor or --web-only, not both.");
  }

  if (!existsSync(TEMPLATE_DIR)) {
    console.error(
      "Template folder missing. If developing in the monorepo, run: npm run create:sync-template",
    );
    process.exit(1);
  }

  const projectDir = resolve(process.cwd(), projectDirArg);
  if (existsSync(projectDir)) {
    const entries = readdirSync(projectDir);
    if (entries.length > 0) {
      throw new Error(`Target directory is not empty: ${projectDir}`);
    }
  } else {
    mkdirSync(projectDir, { recursive: true });
  }

  const projectName = projectDirArg.replace(/\\/g, "/").split("/").pop();
  if (!projectName || projectName === "." || projectName === "..") {
    throw new Error(`Could not derive package name from "${projectDirArg}"`);
  }
  assertNpmPackageName(projectName);

  const displayName = toDisplayName(projectName);
  const map = {
    "%%PROJECT_NAME%%": projectName,
    "%%DISPLAY_NAME%%": displayName,
    "%%APSPRESSO_VERSION%%": appspresso,
  };

  cpSync(TEMPLATE_DIR, projectDir, { recursive: true });

  for (const file of walkFiles(projectDir)) {
    const rel = file.slice(projectDir.length + 1);
    if (rel === "package-lock.json") continue;
    if (!TEXT_EXT.test(rel)) continue;
    const raw = readFileSync(file, "utf8");
    const next = applyPlaceholders(raw, map);
    if (next !== raw) writeFileSync(file, next);
  }

  if (withCapacitor) {
    applyCapacitorLayer(projectDir);
  } else if (webOnly) {
    appendWebOnlyNote(projectDir);
  }

  if (!skipInstall) {
    const r = spawnSync("npm", ["install"], {
      cwd: projectDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }

  console.log(`
Created ${displayName} at ${projectDir}
Next:
  cd ${projectDirArg}
  ${skipInstall ? "npm install\n  " : ""}${withCapacitor ? "npx cap add android\n  npx cap add ios\n  npm run cap:sync\n  " : ""}npm run dev
`);
}

try {
  main();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
