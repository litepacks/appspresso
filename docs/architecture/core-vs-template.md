# Core vs template API

## Stable foundation surface (intended for v0.1+)

Use these for production apps:

- `appspresso/app/mount` — `bootAppspressoHost`
- `appspresso/app/providers/*`, `appspresso/app/bootstrap` (via hooks)
- `appspresso/config`, `appspresso/api/*`, `appspresso/auth/*`
- `appspresso/services/*`, `appspresso/hooks/*`, `appspresso/sync/*`, `appspresso/db/*`
- `appspresso/components/ui/*`, `appspresso/components/shell`, `appspresso/components/form`
- `appspresso/build/*` — Vite/Capacitor integration

Integration tests in `src/test/integration/exports.test.ts` guard many of these entry points.

## Template / demo surface (unstable in 0.x)

- `appspresso/pages/*` — sample screens (Home, Settings, …)
- `appspresso/template/*` — **alias** to the same files as `pages/*`; prefer this import path for starter UI you plan to replace

These ship in `dist-lib` for convenience but may move to a separate package or change without a major semver bump until **1.0**.

## Recommended host setup

1. `appspresso init` or integrate into an existing Vite app.
2. Replace `src/pages` with your own routes.
3. Pass `adapter` to `AuthProvider` (Firebase/Supabase) — tokens sync to HTTP automatically.
4. Omit demo-only providers via `AppspressoRootProviders omit={[...]}`.

## Semver policy (0.x)

- **Patch/minor** — bug fixes and additive exports under `app/`, `services/`, `hooks/`, `config/`.
- **Template pages** — may change layout or copy without a major bump; pin `appspresso` if you import pages directly.
- **1.0** — goal: split `@appspresso/template` (or equivalent) from core package.
