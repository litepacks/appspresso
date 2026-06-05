import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runModuleList, runModuleDoctor } from "./module.mjs";

describe("module cli", () => {
  it("runModuleList does not throw without modules file", () => {
    const dir = mkdtempSync(join(tmpdir(), "appkit-mod-"));
    try {
      runModuleList(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("runModuleDoctor exits when modules file missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "appkit-mod-"));
    let code = 0;
    const orig = process.exit;
    process.exit = (c) => {
      code = c ?? 0;
    };
    try {
      runModuleDoctor(dir);
    } finally {
      process.exit = orig;
      rmSync(dir, { recursive: true, force: true });
    }
    assert.equal(code, 1);
  });

  it("ensureModulesFile pattern via manual write", () => {
    const dir = mkdtempSync(join(tmpdir(), "appkit-mod-"));
    const src = join(dir, "src");
    try {
      mkdirSync(src, { recursive: true });
      writeFileSync(
        join(src, "appspresso.modules.ts"),
        'import { authModule } from "@appspresso/module-auth";\nexport const modules = [authModule()];\n',
      );
      const content = readFileSync(join(src, "appspresso.modules.ts"), "utf8");
      assert.match(content, /module-auth/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
