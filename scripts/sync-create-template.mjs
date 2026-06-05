#!/usr/bin/env node
/**
 * Copies `demo/` → `packages/create-appspresso/template` with scaffold tokens.
 * Run from repo root: `node scripts/sync-create-template.mjs`
 */
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __root = join(dirname(fileURLToPath(import.meta.url)), "..");
const demo = join(__root, "demo");
const template = join(__root, "packages", "create-appspresso", "template");

/**
 * So the published template runs standalone (hoists from demo monorepo root).
 */
const hostDependencies = {
  react: "^19.2.5",
  "react-dom": "^19.2.5",
  motion: "^12.0.0",
  dayjs: "^1.11.13",
  "react-hook-form": "^7.0.0",
  "@hookform/resolvers": "^5.0.0",
};

const hostDevDependencies = {
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.1",
  autoprefixer: "^10.5.0",
  postcss: "^8.5.14",
  tailwindcss: "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  typescript: "~6.0.2",
  vite: "^8.0.10",
};

function shouldCopy(srcPath) {
  const rel = srcPath.slice(demo.length + 1);
  if (!rel) return true;
  if (rel === "node_modules" || rel.startsWith("node_modules/")) return false;
  if (rel === "dist" || rel.startsWith("dist/")) return false;
  if (rel === "ios" || rel.startsWith("ios/")) return false;
  if (rel === "android" || rel.startsWith("android/")) return false;
  if (rel === "package-lock.json") return false;
  if (rel === "capacitor.config.ts" || rel === "capacitor.config.json") {
    return false;
  }
  return true;
}

rmSync(template, { recursive: true, force: true });
mkdirSync(join(__root, "packages", "create-appspresso"), { recursive: true });
cpSync(demo, template, {
  recursive: true,
  filter: (s) => shouldCopy(s),
});

const pkgPath = join(template, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.name = "%%PROJECT_NAME%%";
delete pkg.private;
pkg.dependencies = {
  appspresso: "%%APSPRESSO_VERSION%%",
  ...hostDependencies,
};
pkg.devDependencies = { ...hostDevDependencies };
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const patchText = (rel, fn) => {
  const p = join(template, rel);
  writeFileSync(p, fn(readFileSync(p, "utf8")));
};

patchText("index.html", (s) =>
  s.replace(/Appspresso demo/g, "%%DISPLAY_NAME%%"),
);

const hostTsconfig = {
  compilerOptions: {
    target: "ES2023",
    lib: ["ES2023", "DOM", "DOM.Iterable"],
    module: "ESNext",
    types: ["vite/client"],
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    resolveJsonModule: true,
    moduleDetection: "force",
    noEmit: true,
    jsx: "react-jsx",
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    erasableSyntaxOnly: true,
    noFallthroughCasesInSwitch: true,
  },
  include: ["src", "appspresso.config.ts"],
};

writeFileSync(
  join(template, "tsconfig.json"),
  `${JSON.stringify(hostTsconfig, null, 2)}\n`,
);

const showcaseScripts = {
  dev: "appspresso dev",
  build: "appspresso build",
  preview: "appspresso preview",
  doctor: "appspresso doctor",
  info: "appspresso info",
  "cap:config": "appspresso cap:config",
  "cap:assets": "node scripts/sync-capacitor-assets.mjs",
  "cap:sync": "appspresso native sync",
  "cap:open:android": "appspresso native open android",
  "cap:open:ios": "appspresso native open ios",
};
pkg.scripts = showcaseScripts;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const envExample = `# Copy to \`.env\` (never commit secrets)

VITE_API_BASE_URL=
VITE_ENABLE_DEBUG_PANEL=
`;
writeFileSync(join(template, ".env.example"), envExample);

const readme = `# %%DISPLAY_NAME%%

**Showcase** Appspresso app — vocabulary demo with routing, Jotai, i18n, and kit playground cards.

For a smaller starter: \`npm create appspresso@latest my-app\` (minimal template, default).

## Quick start

\`\`\`bash
cp .env.example .env
npm install
npm run dev
\`\`\`

## Project map

| File | Role |
|------|------|
| \`src/main.tsx\` | \`bootAppspressoHost\` entry |
| \`src/DemoShowcaseApp.tsx\` | App shell |
| \`src/demo-router.tsx\` | Routes |
| \`appspresso.config.ts\` | Vite + app meta |

## Create again

\`\`\`bash
npm create appspresso@latest %%PROJECT_NAME%% -- --template showcase
\`\`\`
`;

writeFileSync(join(template, "README.md"), readme);

console.log("Template synced:", template);
