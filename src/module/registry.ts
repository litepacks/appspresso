import type { ReactNode } from "react";
import { logger } from "@/lib/logger";
import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { SQLITE_DB_NAME } from "@/db/constants";
import { isSqliteOpen } from "@/db/sqlite-open";
import { Capacitor } from "@capacitor/core";
import {
  createModuleContext,
  isModuleActiveOnPlatform,
} from "./context";
import { ModuleConflictError, ModuleDependencyCycleError } from "./errors";
import type { ModuleContext, ResolvedAppspressoModule } from "./types";

export type ModuleRegistrySummary = {
  names: string[];
  skipped: string[];
};

export class ModuleRegistry {
  readonly #modules: ResolvedAppspressoModule[];
  readonly #ctx: ModuleContext;
  readonly #active: ResolvedAppspressoModule[] = [];
  readonly #skipped: string[] = [];

  constructor(modules: readonly ResolvedAppspressoModule[]) {
    this.#modules = [...modules];
    validateConflicts(this.#modules);
    const sorted = topologicalSortModules(this.#modules);
    for (const mod of sorted) {
      if (!isModuleActiveOnPlatform(mod.platforms)) {
        this.#skipped.push(mod.name);
        logger.warn("module:skip platform", { name: mod.name });
        continue;
      }
      this.#active.push(mod);
    }
    this.#ctx = createModuleContext();
  }

  get context(): ModuleContext {
    return this.#ctx;
  }

  get activeModules(): readonly ResolvedAppspressoModule[] {
    return this.#active;
  }

  get summary(): ModuleRegistrySummary {
    return {
      names: this.#active.map((m) => m.name),
      skipped: [...this.#skipped],
    };
  }

  async runSetupAll(): Promise<void> {
    for (const mod of this.#active) {
      if (mod.i18n) this.#ctx.mergeI18n(mod.i18n);
      if (mod.setup) await mod.setup(this.#ctx, mod.config);
    }
  }

  async runOnBootstrapAll(): Promise<void> {
    for (const mod of this.#active) {
      if (mod.onBootstrap) await mod.onBootstrap(this.#ctx, mod.config);
      await runModuleMigrations(mod);
    }
  }

  async runDisposeAll(): Promise<void> {
    for (const mod of [...this.#active].reverse()) {
      if (mod.dispose) await mod.dispose(this.#ctx, mod.config);
    }
  }

  wrapProviders(children: ReactNode): ReactNode {
    let node = children;
    for (const mod of this.#active) {
      if (mod.providers) {
        node = mod.providers(this.#ctx, mod.config, node);
      }
    }
    return node;
  }
}

export function createModuleRegistry(
  modules: readonly ResolvedAppspressoModule[],
): ModuleRegistry {
  return new ModuleRegistry(modules);
}

function validateConflicts(modules: ResolvedAppspressoModule[]): void {
  const names = new Set(modules.map((m) => m.name));
  for (const mod of modules) {
    for (const other of mod.conflicts) {
      if (names.has(other)) {
        throw new ModuleConflictError(mod.name, other);
      }
    }
  }
}

function topologicalSortModules(
  modules: ResolvedAppspressoModule[],
): ResolvedAppspressoModule[] {
  const byName = new Map(modules.map((m) => [m.name, m]));
  const names = new Set(byName.keys());
  const visited = new Set<string>();
  const stack = new Set<string>();
  const out: ResolvedAppspressoModule[] = [];

  function visit(name: string): void {
    if (visited.has(name)) return;
    if (stack.has(name)) {
      throw new ModuleDependencyCycleError([...stack, name]);
    }
    stack.add(name);
    const mod = byName.get(name);
    if (mod) {
      for (const dep of mod.after) {
        if (names.has(dep)) visit(dep);
      }
    }
    stack.delete(name);
    visited.add(name);
    if (mod) out.push(mod);
  }

  for (const name of [...names].sort()) {
    visit(name);
  }
  return out;
}

async function runModuleMigrations(
  mod: ResolvedAppspressoModule,
): Promise<void> {
  if (!mod.migrations?.length) return;
  if (Capacitor.getPlatform() === "web" || !isSqliteOpen()) return;
  const CapacitorSQLite = await loadCapacitorSQLite();
  const exec = {
    async query(statement: string, values: unknown[] = []) {
      const res = await CapacitorSQLite.query({
        database: SQLITE_DB_NAME,
        statement,
        values,
      });
      return (res?.values ?? []) as unknown[][];
    },
    async execute(statements: string) {
      await CapacitorSQLite.execute({
        database: SQLITE_DB_NAME,
        statements,
        transaction: true,
      });
    },
    async run(statement: string, values: unknown[] = []) {
      await CapacitorSQLite.run({
        database: SQLITE_DB_NAME,
        statement,
        values,
      });
    },
  };
  for (const migration of mod.migrations) {
    await exec.execute(migration.statements);
    logger.info("module.migration", { module: mod.name, version: migration.version });
  }
}
