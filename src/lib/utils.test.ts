import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind-conflicting classes with tw-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("joins conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
