# Troubleshooting

## Bootstrap / splash

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| Stuck on splash then error screen | `runBootstrap` failed (DB, appearance, config) | Read dev error text; check logs; use **Try again** or fix env/config |
| White flash before splash | Document background | Set `app.splash.backgroundColor` in `appspresso.config.ts` |
| Native app slow after splash | SQLite deferred ~4s by design | Wait for DB; avoid enqueue-critical native sync before DB ready (buffer handles this in v0.1+) |

## SQLite

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| `sqlite.error` in UI | Plugin missing or init failed | Install `@capacitor-community/sqlite`, run `cap sync`, check `appspresso doctor` |
| Sync not persisting on native early | DB not open yet | Ensure you're on v0.1+ (buffer + flush after init) |

## Auth / API

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| 401 from API with Firebase/Supabase | Token not in session store (pre-0.1) or custom adapter | Use `createFirebaseAuthAdapter` / `createSupabaseAuthAdapter`; verify `getAccessToken()` after sign-in |
| Demo user always signed in | Demo adapter | Replace adapter in production |

## Native build

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| `assets/public` missing in APK | Web bundle not built before sync | `npm run build` then `appspresso native sync` |
| Maestro cannot find app | Wrong `appId` | Run `npm run verify:maestro-app-id`; align `e2e/maestro/config.yaml` with `appspresso.config.ts` |
| iOS build fails | Pods / platform | `npx cap add ios`, `pod install`, Xcode SDK |

## Tests / CI

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| Integration tests fail | Stale `dist-lib` | `npm run build:lib` then `npm run test:integration` |
| Coverage CI red | Below thresholds (70% lines, …) | `npm run test:coverage` locally, add tests for uncovered modules |
| `npm audit` fails | High/critical advisory | `npm audit`; update dependency or document exception |

## Environment

- Only **`VITE_*`** variables are exposed to the client.
- Never put API secrets in `VITE_*`; use your backend or native secure flows.

See [security.md](./security.md).
