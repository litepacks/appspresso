import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

  it("sets templateFromCli only when --template is passed", () => {
    const without = parseInitArgs(["my-app"]);
    assert.equal(without.templateFromCli, false);
    assert.equal(without.template, undefined);

    const withTpl = parseInitArgs(["my-app", "--template", "showcase"]);
    assert.equal(withTpl.templateFromCli, true);
    assert.equal(withTpl.template, "showcase");
  });

  it("accepts --hybrid as alias for --with-capacitor", () => {
    const f = parseInitArgs(["app", "--hybrid"]);
    assert.equal(f.withCapacitor, true);
  });

  it("defaults appspresso range", () => {
    const f = parseInitArgs(["my-app"]);
    assert.equal(f.appspresso, "^0.1.0");
  });

  it("rejects unknown flags", () => {
    assert.throws(() => parseInitArgs(["my-app", "--nope"]), /Unknown option/);
  });

  it("rejects invalid template", () => {
    assert.throws(
      () => parseInitArgs(["my-app", "--template", "full"]),
      /--template must be/,
    );
  });
});
