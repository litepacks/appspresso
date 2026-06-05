import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { SCHEMA_VERSION_KEY, SQLITE_DB_NAME } from "@/db/constants";
import { LATEST_SCHEMA_VERSION, MIGRATIONS } from "@/db/migrations/index";
import { logger } from "@/lib/logger";

export type SqliteExecutor = {
  query: (statement: string, values?: unknown[]) => Promise<unknown[][]>;
  execute: (statements: string) => Promise<void>;
  run: (statement: string, values?: unknown[]) => Promise<void>;
};

async function readSchemaVersion(exec: SqliteExecutor): Promise<number> {
  try {
    const rows = await exec.query(
      "SELECT value FROM app_settings WHERE key = ? LIMIT 1",
      [SCHEMA_VERSION_KEY],
    );
    const raw = rows[0]?.[0];
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function writeSchemaVersion(
  exec: SqliteExecutor,
  version: number,
): Promise<void> {
  const now = new Date().toISOString();
  await exec.run(
    "INSERT INTO app_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [SCHEMA_VERSION_KEY, String(version)],
  );
  try {
    await exec.run(
      "INSERT INTO appspresso_sync_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      ["schema_version", String(version), now],
    );
  } catch {
    /* sync_state table appears in migration 002 */
  }
}

export async function runMigrationsWithExecutor(
  exec: SqliteExecutor,
): Promise<number> {
  let current = await readSchemaVersion(exec);
  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    await exec.execute(migration.statements);
    current = migration.version;
    await writeSchemaVersion(exec, current);
    logger.info("db.migration", { version: current });
  }
  return current;
}

/** Run pending migrations on the native Capacitor SQLite connection. */
export async function runMigrations(): Promise<number> {
  const CapacitorSQLite = await loadCapacitorSQLite();
  const exec: SqliteExecutor = {
    async query(statement, values = []) {
      const res = await CapacitorSQLite.query({
        database: SQLITE_DB_NAME,
        statement,
        values,
      });
      return (res?.values ?? []) as unknown[][];
    },
    async execute(statements) {
      await CapacitorSQLite.execute({
        database: SQLITE_DB_NAME,
        statements,
        transaction: true,
      });
    },
    async run(statement, values = []) {
      await CapacitorSQLite.run({
        database: SQLITE_DB_NAME,
        statement,
        values,
      });
    },
  };
  return runMigrationsWithExecutor(exec);
}

export { LATEST_SCHEMA_VERSION };
