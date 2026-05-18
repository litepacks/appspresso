import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getTelHref,
  isPhoneDialEnvironment,
  normalizeTelNumber,
  openPhoneDial,
} from "@/lib/phone-dial";

function stubWindowLocationAssign(assign: ReturnType<typeof vi.fn>) {
  vi.stubGlobal(
    "window",
    new Proxy(globalThis.window as Window, {
      get(target, prop, receiver) {
        if (prop === "location") {
          return { assign, href: "" };
        }
        return Reflect.get(target, prop, receiver);
      },
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeTelNumber", () => {
  it("normalizes country code and separators", () => {
    expect(normalizeTelNumber("+90 532 000 11 22")).toBe("+905320001122");
    expect(normalizeTelNumber("(0212) 555-0100")).toBe("02125550100");
  });

  it("too short or invalid", () => {
    expect(normalizeTelNumber("12")).toBeNull();
    expect(normalizeTelNumber("abc")).toBeNull();
    expect(normalizeTelNumber("")).toBeNull();
  });
});

describe("getTelHref", () => {
  it("produces tel URI", () => {
    expect(getTelHref("0555 010 20 30")).toBe("tel:05550102030");
  });
});

describe("openPhoneDial", () => {
  it("calls tel assign for valid number", () => {
    const assign = vi.fn();
    stubWindowLocationAssign(assign);
    expect(openPhoneDial("+1 555 0100")).toBe(true);
    expect(assign).toHaveBeenCalledWith("tel:+15550100");
  });

  it("no assign when invalid", () => {
    const assign = vi.fn();
    stubWindowLocationAssign(assign);
    expect(openPhoneDial("xx")).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });

  it("environment check", () => {
    expect(isPhoneDialEnvironment()).toBe(true);
  });
});
