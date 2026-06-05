# Changelog

All notable changes to the Appspresso foundation package are documented here.

## [0.6.0] - 2026-06-04

### App modules

- **`appspresso/module`:** `defineModule`, `ModuleRegistry`, `createModuleRegistry`, route + app route merge
- **`AppspressoHost`:** `modules` prop; combined bootstrap with plugins
- **Router:** `createAppspressoBrowserRouter({ modules, appRoutes, legacyShowcase })`
- **Official packages:** `@appspresso/module-onboarding`, `module-auth`, `module-settings`, `module-notifications`, `module-subscriptions`
- **Auth screens:** register + forgot password routes (core pages; wired by module-auth)
- **CLI:** `appspresso add`, `remove`, `module list`, `module doctor`, `module info`
- **Customization:** `screens` overrides, `basePath`, feature flags on auth module
- **Docs:** `docs/guides/modules.md`, `docs/architecture/modules-vs-plugins.md`
- **Example:** `examples/module-host`
- **Template:** `src/appspresso.modules.ts` stub in minimal scaffold

## [0.5.0] - 2026-06-04

### Offline-first platform

- **Migrations:** Versioned runner; `appspresso_outbox`, `appspresso_sync_state`, `appspresso_conflicts`; legacy `sync_outbox` row migration
- **Outbox:** Statuses `pending` / `processing` / `synced` / `failed` / `dead`; idempotency keys; processing lease recovery; web IndexedDB store
- **SyncEngine:** Push FIFO + pull phase; auth pause on 401; `syncEngineRunOnce`, `resumeSyncAfterAuth`
- **API:** `createSyncProvider`, `registerSyncProvider`, `enqueueEntityMutation`, `createRestSyncProvider`, `appspresso/sync` barrel
- **Conflicts:** `appspresso_conflicts` logging; server-wins pull apply; tombstone support in pull applier
- **Diagnostics:** Extended `syncStatusAtom`; DebugPanel outbox/conflicts/logs; CLI `appspresso sync` / `outbox`
- **Lifecycle:** Flush on native resume / web visibility
- **Docs:** `docs/architecture/offline-first.md`; updated offline playbook
- **Example:** `todo-offline` persists todos to localStorage and uses entity-scoped enqueue

## [0.3.0] - 2026-06-04

### Plugin system

- **`appspresso/plugin`:** `definePlugin`, `PluginRegistry`, `PluginContext`, capability checks, lifecycle hooks
- **`AppspressoHost`:** providers + bootstrap + plugin registry in one shell
- **Bootstrap:** plugin `onBootstrap` after remote config; `onAppReady` on gate ready; error reporters chain to `captureException`
- **Official packages:** `@appspresso/plugin-sentry`, `@appspresso/plugin-firebase-auth`, `@appspresso/plugin-supabase-auth`, `@appspresso/plugin-posthog`, `@appspresso/plugin-testing`
- **Compatibility:** `appspresso/auth/adapters/firebase` and `supabase` re-export from official plugins
- **DX:** `appspresso doctor` lists `@appspresso/plugin-*` deps; `examples/plugin-host`; minimal template uses `AppspressoHost`
- **Docs:** `docs/guides/plugins.md`, `docs/reference/plugin-api.md`, `docs/architecture/plugins-vs-capacitor.md`

## [0.2.0] - 2026-06-04

### Developer Experience

- **Templates:** `minimal` (default) and `showcase` via `--template`; `template-minimal` scaffold with short config
- **CLI:** `appspresso create`, `info`, `analyze`, `clean`; expanded `doctor`; init next-steps checklist; optional `cap add` wizard
- **Docs:** `docs/getting-started/`, `docs/guides/`, `docs/reference/cli.md`
- **Examples:** `examples/minimal-host`, `examples/todo-offline`
- **Debug:** startup summary log (dev); debug panel shows bootstrap, network, sync, SQLite
- **Defaults:** new projects use `appspresso ^0.1.0`; template `.env.example` and consumer-friendly `package.json` scripts

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
