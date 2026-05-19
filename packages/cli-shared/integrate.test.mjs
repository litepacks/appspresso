import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { runIntegrate } from "./integrate.mjs";
import { normalizeManifest } from "./manifest.mjs";

describe("integrate", () => {
  it("patches package.json and writes minimal config", () => {
    const dir = mkdtempSync(join(tmpdir(), "appspresso-integrate-"));
    try {
      writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify({ name: "old-name", version: "0.0.0", scripts: {} }, null, 2)}\n`,
      );
      const manifest = normalizeManifest({
        packageName: "my-app",
        displayName: "My App",
        appId: "com.example.myapp",
        version: "1.0.0",
        appspressoVersion: "^0.0.1",
        capacitor: false,
      });
      runIntegrate({ projectDir: dir, manifest, force: false });
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      assert.equal(pkg.name, "my-app");
      assert.equal(pkg.dependencies.appspresso, "^0.0.1");
      assert.equal(pkg.scripts.dev, "appspresso dev");
      const config = readFileSync(join(dir, "appspresso.config.ts"), "utf8");
      assert.match(config, /com\.example\.myapp/);
      assert.match(config, /My App/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
