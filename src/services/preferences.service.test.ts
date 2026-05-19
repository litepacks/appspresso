import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY_PREFIX } from "@/config/constants";
import { preferencesService } from "@/services/preferences.service";

describe("preferencesService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads under prefixed key", () => {
    preferencesService.set("theme", "dark");
    expect(localStorage.getItem(`${STORAGE_KEY_PREFIX}pref_theme`)).toBe(
      "dark",
    );
    expect(preferencesService.get("theme")).toBe("dark");
  });

  it("get returns null when localStorage throws", () => {
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(preferencesService.get("theme")).toBeNull();
    spy.mockRestore();
  });

  it("set ignores localStorage write failures", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(() => preferencesService.set("theme", "dark")).not.toThrow();
    spy.mockRestore();
  });
});
