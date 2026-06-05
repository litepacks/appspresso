/** v2 — platform outbox, sync state, conflicts + legacy row migration */
export const migration002 = {
  version: 2,
  statements: `
CREATE TABLE IF NOT EXISTS appspresso_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_local_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('create','update','delete','custom')),
  operation TEXT,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','synced','failed','dead')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  scheduled_at TEXT,
  synced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_sched ON appspresso_outbox(status, scheduled_at, id);

CREATE TABLE IF NOT EXISTS appspresso_sync_state (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appspresso_conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_local_id TEXT NOT NULL,
  remote_id TEXT,
  strategy TEXT NOT NULL,
  local_snapshot TEXT NOT NULL,
  remote_snapshot TEXT NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

INSERT OR IGNORE INTO appspresso_outbox (
  idempotency_key,
  entity_type,
  entity_local_id,
  action,
  operation,
  payload,
  status,
  attempts,
  last_error,
  created_at,
  updated_at,
  scheduled_at
)
SELECT
  'legacy:' || id,
  '_legacy',
  NULL,
  'custom',
  operation,
  payload,
  CASE WHEN status = 'failed' THEN 'failed' ELSE 'pending' END,
  COALESCE(attempts, 0),
  NULL,
  created_at,
  created_at,
  NULL
FROM sync_outbox
WHERE NOT EXISTS (
  SELECT 1 FROM appspresso_outbox o WHERE o.idempotency_key = 'legacy:' || sync_outbox.id
);
`.trim(),
};
