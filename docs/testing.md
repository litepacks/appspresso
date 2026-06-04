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

CI job `coverage` fails when thresholds are not met.

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

Maestro flows in `e2e/maestro/`. Requires built app on emulator/simulator. Keep `appId` in sync: `npm run verify:maestro-app-id`.
