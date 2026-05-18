# Offline-first (outbox + SQLite + sync)

## Summary

1. **Local persistence**: User data and draft operations are stored locally first; the app keeps working when the network drops.
2. **Outbox**: Mutations destined for the server are queued in order (`src/sync/sync.service.ts` and related modules).
3. **SQLite**: On native, storage via `@capacitor-community/sqlite`; on web this path is usually limited — reflect environment in the UI.
4. **Flush order**: When connectivity returns, drain the queue safely first, then pull to align server state; conflict resolution is product-specific.

## Checklist

- [ ] Sync triggers defined for first load and after sign-in?
- [ ] Retries and upper bounds for failed requests?
- [ ] User feedback for “syncing” / “pending” states?

## Related code

- `src/sync/sync.service.ts`
- `src/hooks/useSqliteSetting.ts` (example settings key persistence)
