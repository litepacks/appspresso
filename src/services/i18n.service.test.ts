import { describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { changeAppLanguage } from "@/services/i18n.service";

describe("changeAppLanguage", () => {
  it("forwards to i18n.changeLanguage", () => {
    const spy = vi
      .spyOn(i18n, "changeLanguage")
      .mockResolvedValue(undefined as never);
    changeAppLanguage("en");
    expect(spy).toHaveBeenCalledWith("en");
    spy.mockRestore();
  });
});
