# CLI reference

## Project

| Command | Description |
|---------|-------------|
| `appspresso create [dir]` | New app (alias for init) |
| `appspresso init [dir]` | Scaffold or integrate |
| `appspresso doctor` | Environment + project checks |
| `appspresso info [--map]` | Project summary |
| `appspresso analyze` | `dist/assets` sizes (after build) |
| `appspresso clean [-y]` | Remove build artifacts |

### Init flags

- `--template minimal|showcase` (default: minimal)
- `--with-capacitor` / `--web-only`
- `--appspresso ^0.1.0`
- `-y` non-interactive

## Dev server

| Command | Description |
|---------|-------------|
| `appspresso dev` | Vite dev (uses `appspresso.config.ts`) |
| `appspresso build` | Production build |
| `appspresso preview` | Preview `dist/` |

## Native

| Command | Description |
|---------|-------------|
| `appspresso native sync [--skip-build]` | Build + cap sync |
| `appspresso native open android\|ios` | Open IDE |
| `appspresso native run android\|ios` | `cap run` |
| `appspresso native assemble android\|ios` | Debug build |
| `appspresso cap:config` | Emit `capacitor.config.json` |
