import { migration001 } from "./001_initial";
import { migration002 } from "./002_offline";

export type DbMigration = {
  version: number;
  statements: string;
};

export const MIGRATIONS: DbMigration[] = [migration001, migration002];

export const LATEST_SCHEMA_VERSION =
  MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;
