# Offline-first platform (v0.5)

Appspresso provides a **durable outbox**, **SyncEngine**, and **SyncProvider** contract. Host apps own entity SQLite tables and wire `registerSyncProvider`.

## Entity metadata (host tables)

Required columns on synced entities:

| Column | Purpose |
|--------|---------|
| `local_id` | UUID before remote id exists |
| `sync_status` | `local_only` \| `pending` \| `synced` \| `conflict` |
| `version` | Optimistic concurrency |
| `updated_at` | ISO timestamp for LWW |

Optional: `remote_id`, `deleted_at`, `last_synced_at`, `conflict_state`.

See `EntitySyncMeta` in `appspresso/sync`.

## Platform tables (native SQLite)

- `appspresso_outbox` — durable jobs (`pending` → `processing` → `synced` / `failed` / `dead`)
- `appspresso_sync_state` — pull cursors, engine pause, timestamps
- `appspresso_conflicts` — conflict audit log

Web uses **IndexedDB** for the outbox (no entity SQLite).

## SyncProvider

```ts
import {
  createSyncProvider,
  registerSyncProvider,
} from "appspresso/sync";

registerSyncProvider(
  createSyncProvider({
    name: "my-api",
    async push(job) { /* ... */ },
    async pull(cursor) { /* ... */ },
  }),
);
```

Legacy apps without a provider still get `legacy-http` (generic POST from payload.path).

## Lifecycle

1. Write locally first (host repository).
2. `enqueueEntityMutation` or `enqueueOutbox`.
3. On online / resume / manual flush → `SyncEngine.runOnce()` (push then pull).

## Diagnostics

- In-app: DebugPanel (outbox list, conflicts, sync logs).
- CLI: `appspresso sync status`, `sync check` (package hints; live DB is on-device).
