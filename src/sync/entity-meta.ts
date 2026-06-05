/** Host-defined entity sync metadata (column convention, not generated). */

export type EntitySyncStatus =
  | "local_only"
  | "pending"
  | "synced"
  | "conflict";

export type EntitySyncMeta = {
  local_id: string;
  remote_id?: string | null;
  sync_status: EntitySyncStatus;
  version: number | string;
  updated_at: string;
  deleted_at?: string | null;
  last_synced_at?: string | null;
  conflict_state?: number | null;
};

export const ENTITY_SYNC_REQUIRED_FIELDS = [
  "local_id",
  "sync_status",
  "version",
  "updated_at",
] as const satisfies readonly (keyof EntitySyncMeta)[];
