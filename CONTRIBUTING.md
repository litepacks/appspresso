# Contributing to Appspresso

Thank you for helping improve the Appspresso foundation. This repo is both a **publishable library** (`appspresso` on npm) and a **reference app** (`src/`, `demo/`).

## Prerequisites

- Node.js 20+
- For native work: Android Studio and/or Xcode, Capacitor tooling (`appspresso doctor`)

## Setup

```bash
npm ci
cp .env.example .env
npm run build:lib
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Root template Vite dev server |
| `npm run demo:dev` | Demo app (linked `file:..` library) |
| `npm run lint` / `lint:fix` | Biome |
| `npm run test:run` | Unit tests (Vitest) |
| `npm run test:cli` | CLI shared tests (Node test runner) |
| `npm run test:integration` | Built `dist-lib` integration tests |
| `npm run test:all` | Unit + CLI + integration |
| `npm run test:coverage` | Unit tests + coverage thresholds |
| `npm run build:lib` | Publishable `dist-lib/` output |

Before publishing `create-appspresso`, sync the scaffold from demo:

```bash
npm run create:sync-template
```

## Code guidelines

- Match existing patterns: services for side effects, Jotai `appStore` for cross-cutting UI state, Zod for config/env.
- Keep `src/services/` free of imports from `src/pages/`.
- Prefer `reportError` for unexpected failures; avoid empty `catch` in bootstrap or sync paths.
- TypeScript: `tsconfig.app.json` uses **`strict: true`** — fix types at the source.
- Tests: add or extend Vitest files next to the module (`*.test.ts` / `*.test.tsx`). Critical paths: bootstrap, auth adapters, sync, config.

## Pull requests

1. Run `npm run lint` and `npm run test:all` locally.
2. If you change public exports or `dist-lib`, run `npm run test:integration`.
3. Update docs when behavior or env vars change (`README.md`, `docs/`, `CHANGELOG.md`).
4. Do not commit secrets; only `VITE_*` belongs in client env (see `docs/security.md`).

## Architecture

See [docs/architecture/README.md](docs/architecture/README.md) for host vs library boundaries and bootstrap flow.
