import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { runInit } from "./init.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

describe("create-appspresso scaffold smoke", () => {
  it("scaffolds minimal template with expected files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "appspresso-smoke-"));
    const prevCwd = process.cwd();
    try {
      process.chdir(repoRoot);
      await runInit(
        [
          dir,
          "-y",
          "--skip-install",
          "--template",
          "minimal",
          "--appspresso",
          `file:${repoRoot}`,
        ],
        { entry: "create" },
      );
      assert.ok(existsSync(join(dir, "package.json")));
      assert.ok(existsSync(join(dir, "appspresso.config.ts")));
      assert.ok(existsSync(join(dir, ".env.example")));
      assert.ok(existsSync(join(dir, "src/main.tsx")));
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      assert.ok(
        !pkg.scripts?.["build:lib"],
        "consumer must not have build:lib",
      );
    } finally {
      process.chdir(prevCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
