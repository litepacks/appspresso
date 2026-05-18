import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppEventBus } from "@/lib/app-events";
import * as reportErrorMod from "@/lib/reportError";

describe("createAppEventBus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits and listens to payloadless event", () => {
    type E = { ping: undefined };
    const bus = createAppEventBus<E>();
    const fn = vi.fn();
    bus.on("ping", fn);
    bus.emit("ping");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toBeUndefined();
  });

  it("emits with payload", () => {
    type E = { msg: { n: number } };
    const bus = createAppEventBus<E>();
    const fn = vi.fn();
    bus.on("msg", fn);
    bus.emit("msg", { n: 7 });
    expect(fn).toHaveBeenCalledWith({ n: 7 });
  });

  it("does not fire after unsubscribe", () => {
    type E = { x: undefined };
    const bus = createAppEventBus<E>();
    const fn = vi.fn();
    const off = bus.on("x", fn);
    off();
    bus.emit("x");
    expect(fn).not.toHaveBeenCalled();
  });

  it("clear removes all listeners", () => {
    type E = { a: undefined; b: undefined };
    const bus = createAppEventBus<E>();
    const fa = vi.fn();
    const fb = vi.fn();
    bus.on("a", fa);
    bus.on("b", fb);
    bus.clear();
    bus.emit("a");
    bus.emit("b");
    expect(fa).not.toHaveBeenCalled();
    expect(fb).not.toHaveBeenCalled();
  });

  it("reportError on listener error; others still run", () => {
    const spy = vi
      .spyOn(reportErrorMod, "reportError")
      .mockImplementation(() => {});
    type E = { boom: undefined };
    const bus = createAppEventBus<E>();
    const bad = vi.fn(() => {
      throw new Error("x");
    });
    const good = vi.fn();
    bus.on("boom", bad);
    bus.on("boom", good);
    bus.emit("boom");
    expect(bad).toHaveBeenCalled();
    expect(good).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });
});
