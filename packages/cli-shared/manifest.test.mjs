import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertAppId,
  assertNpmPackageName,
  normalizeManifest,
  placeholderMap,
  suggestAppId,
  toDisplayName,
  validateManifest,
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
});
