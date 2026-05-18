# create-appspresso

Scaffolds a minimal Vite + React + Tailwind app that depends on [`appspresso`](https://www.npmjs.com/package/appspresso).

```bash
npm create appspresso@latest my-app
```

Same engine as **`appspresso init`** (`@appspresso/cli-shared`): interactive prompts (package name, app id, Capacitor), optional **`appspresso.init.json`**, and path layout (`--src-dir`, `--public-dir`).

## Flags

| Flag | Description |
|------|-------------|
| `--appspresso <range>` | Semver range for the library (default `^0.0.0`) |
| `--with-capacitor` | Capacitor deps + `cap:*` scripts |
| `--web-only` | Web-first README note (not with `--with-capacitor`) |
| `--skip-install` | Skip `npm install` |
| `--config <file>` | Load `appspresso.init.json` |
| `--package-name`, `--app-id`, `--display-name` | Project identity |
| `--src-dir`, `--public-dir` | Folder layout (scaffold remap) |
| `--write-manifest` | Write `appspresso.init.json` after setup |
| `-y, --yes` | Non-interactive (use with identity flags) |

See the main repo [README](../../README.md) for monorepo testing (`npm create ./packages/create-appspresso …`).
