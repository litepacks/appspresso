import { describe, expect, it, vi } from "vitest";
import { runMigrationsWithExecutor } from "./migrate";

describe("runMigrationsWithExecutor", () => {
  it("runs pending migrations and updates schema version", async () => {
    const executed: string[] = [];
    const settings = new Map<string, string>();

    const exec = {
      async query(statement: string, values: unknown[] = []) {
        if (statement.includes("app_settings")) {
          return [[settings.get(String(values[0])) ?? null]];
        }
        return [[]];
      },
      async execute(statements: string) {
        executed.push(statements);
      },
      async run(statement: string, values: unknown[] = []) {
        if (statement.includes("app_settings")) {
          settings.set(String(values[0]), String(values[1]));
        }
      },
    };

    const version = await runMigrationsWithExecutor(exec);
    expect(version).toBe(2);
    expect(executed.length).toBe(2);
    expect(settings.get("schema_version")).toBe("2");
  });

  it("skips migrations already applied", async () => {
    const settings = new Map([["schema_version", "2"]]);
    const exec = {
      async query(statement: string, values: unknown[] = []) {
        if (statement.includes("app_settings")) {
          return [[settings.get(String(values[0])) ?? null]];
        }
        return [[]];
      },
      execute: vi.fn(),
      run: vi.fn(),
    };

    const version = await runMigrationsWithExecutor(exec);
    expect(version).toBe(2);
    expect(exec.execute).not.toHaveBeenCalled();
  });
});
