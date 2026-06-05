/**
 * @param {object} opts
 * @param {string} opts.relDir
 * @param {boolean} opts.skipInstall
 * @param {boolean} opts.capacitor
 * @param {"minimal"|"showcase"} opts.template
 */
export function buildNextStepsChecklist(opts) {
  const { relDir, skipInstall, capacitor, template } = opts;
  const cd = relDir === "." ? null : `cd ${relDir}`;

  const web = [
    cd,
    skipInstall ? "npm install" : null,
    "cp .env.example .env",
    "npm run dev",
    "appspresso doctor",
  ].filter(Boolean);

  const native = capacitor
    ? [
        "--- Native (first time, ~30+ min with Android Studio / Xcode) ---",
        "npx cap add android",
        "npx cap add ios",
        "npm run build",
        "npm run cap:sync",
        "npm run cap:open:android",
      ]
    : [
        "--- Native later ---",
        "appspresso init . --with-capacitor   # or recreate with --with-capacitor",
        "npx cap add android && npx cap add ios",
        "npm run cap:sync",
      ];

  const learn =
    template === "showcase"
      ? [
          "--- Explore showcase ---",
          "Open src/demo-router.tsx and src/pages/",
          "docs/playbooks/offline-sync.md",
        ]
      : [
          "--- Next edits ---",
          "src/AppRoot.tsx — add routes",
          "src/pages/HomePage.tsx — your UI",
          "docs/getting-started/02-first-run-web.md",
        ];

  return [...web, ...native, ...learn].filter(Boolean);
}
