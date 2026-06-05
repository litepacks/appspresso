# Local development

## Consumer app (after `npm create appspresso`)

```bash
npm run dev
appspresso doctor
appspresso info
```

No `build:lib` — the published `appspresso` package includes `dist-lib`.

## This monorepo (contributing)

```bash
npm ci
npm run build:lib
npm run demo:dev
```

Or root template:

```bash
npm run dev
```

After changing library source, rebuild:

```bash
npm run build:lib
```

**Faster rebuild (no `.d.ts`, ~4s):** demo, native E2E, and `ci-prepare-native` use `build:lib:fast`. The slow step you see as `DTS ⚡️ Build success in ~60s` is TypeScript emitting types for 150+ package entry points — only needed before publish or when editing public types.

```bash
npm run build:lib:fast   # JS + sourcemaps only
npm run build:lib        # full publishable output (DTS + incremental cache on 2nd run)
```

## Useful commands

| Command | Purpose |
|---------|---------|
| `appspresso analyze` | Bundle sizes after `npm run build` |
| `appspresso clean -y` | Remove dist, coverage, Gradle caches |
| `npm run test:all` | Unit + CLI + integration |

## Native iteration

```bash
npm run build
npm run cap:sync
npm run cap:open:android
```

Use `--skip-build` on sync if you only changed native project files.
