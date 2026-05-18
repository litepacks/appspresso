import { beforeEach, describe, expect, it } from "vitest";
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
});
