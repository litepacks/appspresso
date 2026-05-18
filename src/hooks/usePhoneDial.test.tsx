import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePhoneDial } from "@/hooks/usePhoneDial";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePhoneDial", () => {
  it("dial triggers tel assign", () => {
    const assign = vi.fn();
    vi.stubGlobal(
      "window",
      new Proxy(globalThis.window as Window, {
        get(target, prop, receiver) {
          if (prop === "location") return { assign, href: "" };
          return Reflect.get(target, prop, receiver);
        },
      }),
    );
    const { result } = renderHook(() => usePhoneDial());
    expect(result.current.canDial("+44 20 0000 0000")).toBe(true);
    expect(result.current.dial("+44 20 0000 0000")).toBe(true);
    expect(assign).toHaveBeenCalledWith("tel:+442000000000");
  });
});
