import { migration001 } from "./migrations/001_initial";
import { migration002 } from "./migrations/002_offline";

/**
 * @deprecated Use versioned `runMigrations()` from `@/db/migrate`.
 * Kept for tests that mock a single execute batch.
 */
export function getMigrationStatements(): string {
  return `${migration001.statements}\n${migration002.statements}`;
}
