import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseInitArgs } from "./parse-init-args.mjs";

describe("parseInitArgs", () => {
  it("parses manifest flags", () => {
    const f = parseInitArgs([
      "my-app",
      "--config",
      "./init.json",
      "--package-name",
      "@acme/app",
      "--app-id",
      "com.acme.app",
      "--with-capacitor",
      "--write-manifest",
    ]);
    assert.deepEqual(f.positional, ["my-app"]);
    assert.equal(f.config, "./init.json");
    assert.equal(f.packageName, "@acme/app");
    assert.equal(f.appId, "com.acme.app");
    assert.equal(f.withCapacitor, true);
    assert.equal(f.writeManifest, true);
  });
});
