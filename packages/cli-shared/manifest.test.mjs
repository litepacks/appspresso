import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  assertAppId,
  assertNpmPackageName,
  assertSafePathSegment,
  loadManifestFile,
  normalizeManifest,
  placeholderMap,
  suggestAppId,
  toDisplayName,
  validateManifest,
  writeInitManifest,
} from "./manifest.mjs";

describe("manifest", () => {
  it("validates scoped package name", () => {
    assert.doesNotThrow(() => assertNpmPackageName("@acme/my-app"));
  });

  it("rejects invalid app id", () => {
    assert.throws(() => assertAppId("MyApp"));
  });

  it("suggests reverse-DNS app id", () => {
    assert.equal(suggestAppId("@acme/my-app"), "com.acme.myapp");
  });

  it("builds placeholder map", () => {
    const m = normalizeManifest({
      packageName: "my-app",
      displayName: "My App",
      appId: "com.example.myapp",
      version: "1.0.0",
      appspressoVersion: "^0.0.1",
    });
    validateManifest(m);
    const map = placeholderMap(m);
    assert.equal(map["%%APP_ID%%"], "com.example.myapp");
    assert.equal(map["%%PROJECT_NAME%%"], "my-app");
  });

  it("toDisplayName title-cases kebab", () => {
    assert.equal(toDisplayName("word-practice"), "Word Practice");
  });

  it("rejects unsafe path segments", () => {
    assert.throws(() => assertSafePathSegment("../src", "paths.src"));
  });

  it("round-trips writeInitManifest and loadManifestFile", () => {
    const dir = mkdtempSync(join(tmpdir(), "appspresso-manifest-"));
    try {
      const manifest = normalizeManifest({
        packageName: "@acme/app",
        displayName: "Acme",
        appId: "com.acme.app",
        version: "2.0.0",
        appspressoVersion: "^1.0.0",
        capacitor: true,
        paths: { src: "app", public: "static", config: "appspresso.config.ts" },
      });
      validateManifest(manifest);
      writeInitManifest(dir, manifest);
      const loaded = loadManifestFile(join(dir, "appspresso.init.json"));
      assert.equal(loaded.packageName, "@acme/app");
      assert.equal(loaded.paths.src, "app");
      assert.equal(loaded.capacitor, true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
