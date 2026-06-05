# Testing

## Run locally

```bash
npm run test:run          # unit (Vitest, jsdom)
npm run test:cli          # packages/cli-shared (node:test)
npm run test:integration  # requires build:lib first
npm run test:all          # all of the above
npm run test:coverage     # unit + coverage thresholds
```

## Coverage policy (v0.1)

Configured in `vitest.coverage.shared.ts`:

| Metric | Minimum (v0.1 CI) | Target (next minor) |
|--------|-------------------|---------------------|
| lines | 68% | 70% |
| functions | 64% | 70% |
| statements | 65% | 70% |
| branches | 56% | 65% |

Template pages (`src/pages/`), dev tools, and default `App`/`router` are excluded from the denominator.

On **main** / **master** pushes, CI job `coverage` fails when thresholds are not met. On pull requests, `coverage-pr` runs informatively and does not block `build`.

## What to test

| Area | Priority |
|------|----------|
| Bootstrap / `runBootstrap` | Critical |
| Auth adapters + session-store | Critical |
| Sync outbox (web + native buffer) | Critical |
| Config Zod (`validate.ts`) | High |
| Services with Capacitor mocks | High |
| UI primitives | Medium (render + interaction) |

## Integration tests

`src/test/integration/` imports from `appspresso/*` → `dist-lib/`. Run after `npm run build:lib` when changing exports or mount behavior.

## Native E2E

Maestro flows under `e2e/maestro/shared/`. Full guide: **[e2e.md](./e2e.md)**.

```bash
npm run e2e:list
npm run e2e:android   # or e2e:ios on macOS
npm run e2e:smoke
```

Keep `appId` in sync: `npm run verify:maestro-app-id`.
