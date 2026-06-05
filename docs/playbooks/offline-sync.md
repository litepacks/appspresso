# Offline-first (outbox + SQLite + sync)

## Summary

1. **Local persistence**: User data is stored locally first; the app keeps working when the network drops.
2. **Outbox**: Mutations are queued in `appspresso_outbox` (native) or IndexedDB (web).
3. **SQLite**: On native, platform tables + host entity tables via `@capacitor-community/sqlite`; web entity SQLite is not available — use TanStack Query persist or host storage.
4. **Flush order**: `SyncEngine.runOnce()` pushes the outbox, then pulls remote changes (when `pull` is implemented on the provider).

## Checklist

- [ ] `registerSyncProvider` configured with `push` (and `pull` when needed)?
- [ ] Entity tables include required sync metadata (`local_id`, `sync_status`, `version`, `updated_at`)?
- [ ] Idempotency keys sent (`Idempotency-Key` header on REST)?
- [ ] Retries and dead-letter jobs reviewed in DebugPanel?
- [ ] User feedback for syncing / pending (`syncStatusAtom`)?

## Related code

- `src/sync/sync.service.ts` — enqueue, `initSyncLayer`, `flushOutbox`
- `src/sync/engine/` — push/pull orchestration
- `src/sync/provider.ts` — `createSyncProvider`
- `docs/architecture/offline-first.md`
