import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { mergeRefs } from "@/lib/merge-refs";

describe("mergeRefs", () => {
  it("updates object refs and invokes callback refs", () => {
    const obj = createRef<HTMLDivElement>();
    const calls: (HTMLDivElement | null)[] = [];
    const cb = (el: HTMLDivElement | null) => {
      calls.push(el);
    };
    const el = document.createElement("div");
    const merged = mergeRefs(obj, cb);
    merged(el);
    expect(obj.current).toBe(el);
    expect(calls).toEqual([el]);
    merged(null);
    expect(obj.current).toBeNull();
    expect(calls).toEqual([el, null]);
  });

  it("skips undefined refs", () => {
    const obj = createRef<number>();
    mergeRefs(undefined, obj)(5);
    expect(obj.current).toBe(5);
  });
});
