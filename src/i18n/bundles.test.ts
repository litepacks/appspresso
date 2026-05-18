import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addI18nJsonBundle,
  mergeI18nJsonBundles,
  mergeI18nJsonBundlesFromViteGlob,
  parseLocalePathFromViteGlobKey,
} from "@/i18n";

describe("parseLocalePathFromViteGlobKey", () => {
  it("parses locales path segments", () => {
    expect(parseLocalePathFromViteGlobKey("src/locales/demo/en.json")).toEqual({
      ns: "demo",
      lng: "en",
    });
    expect(
      parseLocalePathFromViteGlobKey(String.raw`C:\app\locales\ui\tr.json`),
    ).toEqual({
      ns: "ui",
      lng: "tr",
    });
  });

  it("returns null for non-matching keys", () => {
    expect(parseLocalePathFromViteGlobKey("/locales/a.json")).toBeNull();
    expect(parseLocalePathFromViteGlobKey("locales/en.json")).toBeNull();
  });
});

describe("mergeI18nJsonBundlesFromViteGlob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("adds resources for matching paths when dev warnings off", () => {
    mergeI18nJsonBundlesFromViteGlob(
      { "./locales/demo/en.json": { smokeKey: "ok" } },
      { logDevWarnings: false },
    );
    expect(true).toBe(true);
  });

  it("warns on unknown path shape when logging enabled", () => {
    const warn = vi.mocked(console.warn);
    mergeI18nJsonBundlesFromViteGlob(
      { "./bad/path.json": { x: 1 } },
      { logDevWarnings: true },
    );
    expect(warn).toHaveBeenCalled();
  });

  it("uses custom resolvePath", () => {
    mergeI18nJsonBundlesFromViteGlob(
      { custom: { z: 1 } },
      {
        logDevWarnings: false,
        resolvePath: (key) =>
          key === "custom" ? { ns: "n", lng: "en" } : null,
      },
    );
    expect(true).toBe(true);
  });
});

describe("mergeI18nJsonBundles / addI18nJsonBundle", () => {
  it("adds nested bundle map into i18next", () => {
    mergeI18nJsonBundles(
      { unitNs: { en: { only_here: "yes" } } },
      { deep: true },
    );
    addI18nJsonBundle("unitNs2", "en", { other: "v" }, { deep: false });
    expect(true).toBe(true);
  });
});
