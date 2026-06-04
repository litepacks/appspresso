# Changelog

All notable changes to the Appspresso foundation package are documented here.

## [0.1.0] - 2026-06-04

### Foundation

- **Auth:** Firebase and Supabase adapters sync access tokens to `session-store` for `api/http` Bearer headers (`syncHttpAccessToken`).
- **Bootstrap:** Failures set `bootstrapStatusAtom`, surface `BootstrapFailureScreen` with retry/reload; no silent transition to `ready`.
- **Native sync:** In-memory buffer while SQLite is closed; `flushNativePendingBuffer` after DB init; retry reads `attempts` from DB (max 5).
- **TypeScript:** `strict: true` on `tsconfig.app.json` (aligned with create-appspresso template).
- **Testing:** Coverage thresholds in CI (70% lines/functions/statements, 65% branches); bootstrap, bootstrap hook, auth adapter, and sync buffer tests.
- **DX:** `npm run test:all`, `verify:maestro-app-id`, `verify:bundle-budget`, `audit:ci`.
- **Docs:** `CONTRIBUTING.md`, architecture docs, troubleshooting, security guide.
- **Exports:** `appspresso/template/*` alias for starter pages (unstable API; see `docs/architecture/core-vs-template.md`).

### Notes

- Template pages (`appspresso/pages/*`, `appspresso/template/*`) remain in the main package for 0.x; semver for template UI may change without a major bump until 1.0.

## [0.0.2] and earlier

See git history and README for starter template features (Capacitor 7, Jotai, TanStack Query, CLI, Maestro smoke CI).
