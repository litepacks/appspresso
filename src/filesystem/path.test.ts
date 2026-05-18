import { describe, expect, it } from "vitest";
import { joinFilesystemPath, resolveFilesystemLocation } from "./path";

describe("filesystem path", () => {
  it("joins basePath with relative path", () => {
    expect(joinFilesystemPath("demo", "notes.txt")).toBe("demo/notes.txt");
    expect(joinFilesystemPath(undefined, "a.txt")).toBe("a.txt");
  });

  it("resolveFilesystemLocation applies defaults", () => {
    expect(
      resolveFilesystemLocation(
        { defaultDirectory: "DATA", basePath: "appspresso" },
        "log.txt",
      ),
    ).toEqual({ path: "appspresso/log.txt", directory: "DATA" });
  });
});
