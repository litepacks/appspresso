import { describe, expect, it, vi } from "vitest";
import {
  getInjectedHostConfig,
  parseInjectedDefine,
  parseViteDoubleJson,
} from "@/build/inject-env";

function doubleStringify<T>(value: T): string {
  return JSON.stringify(JSON.stringify(value));
}

describe("getInjectedHostConfig", () => {
  it("parses __APSPRESSO_HOST__ payload", () => {
    const payload = doubleStringify({
      mount: { rootElementId: "root", strictMode: true },
      hostBanner: { enabled: true, title: "Demo" },
    });
    vi.stubGlobal("__APSPRESSO_HOST__", payload);
    expect(getInjectedHostConfig()).toEqual({
      mount: { rootElementId: "root", strictMode: true },
      hostBanner: { enabled: true, title: "Demo" },
    });
    vi.unstubAllGlobals();
  });

  it("throws when __APSPRESSO_HOST__ is missing", () => {
    vi.stubGlobal("__APSPRESSO_HOST__", undefined);
    expect(() => getInjectedHostConfig()).toThrow(/missing __APSPRESSO_HOST__/);
    vi.unstubAllGlobals();
  });

  it("throws when payload is invalid", () => {
    vi.stubGlobal("__APSPRESSO_HOST__", "{not-json");
    expect(() => getInjectedHostConfig()).toThrow(/invalid __APSPRESSO_HOST__/);
    vi.unstubAllGlobals();
  });
});

describe("parseViteDoubleJson alias", () => {
  it("matches parseInjectedDefine", () => {
    const inner = { ok: true };
    expect(parseViteDoubleJson(doubleStringify(inner))).toEqual(inner);
  });
});

describe("parseInjectedDefine edge cases", () => {
  it("parses single-level JSON object", () => {
    expect(parseInjectedDefine('{"a":1}')).toEqual({ a: 1 });
  });
});
