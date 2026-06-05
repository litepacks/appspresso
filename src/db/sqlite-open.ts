/** Lightweight SQLite open flag — import this instead of `@/db/sqlite` on cold-start paths. */
let opened = false;

export function isSqliteOpen(): boolean {
  return opened;
}

export function markSqliteOpen(value: boolean): void {
  opened = value;
}
