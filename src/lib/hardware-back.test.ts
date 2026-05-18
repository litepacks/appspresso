import { describe, expect, it } from "vitest";
import {
  clearHardwareBackHandlers,
  dispatchHardwareBack,
  registerHardwareBackHandler,
} from "@/lib/hardware-back";

describe("hardware-back", () => {
  it("last registration runs first; true consumes", () => {
    const order: string[] = [];
    const a = () => {
      order.push("a");
      return false;
    };
    const b = () => {
      order.push("b");
      return true;
    };
    registerHardwareBackHandler(a);
    registerHardwareBackHandler(b);
    expect(dispatchHardwareBack({ canGoBack: true })).toBe(true);
    expect(order).toEqual(["b"]);
    clearHardwareBackHandlers();
  });

  it("removed via register return", () => {
    let n = 0;
    const remove = registerHardwareBackHandler(() => {
      n++;
      return true;
    });
    remove();
    expect(dispatchHardwareBack({ canGoBack: false })).toBe(false);
    expect(n).toBe(0);
  });
});
