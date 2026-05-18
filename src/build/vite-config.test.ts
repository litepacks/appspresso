import { describe, expect, it } from "vitest";
import { faviconLinkTagsFromAppIcon } from "./vite-config";

describe("faviconLinkTagsFromAppIcon", () => {
  it("produces type and apple-touch for svg under public/", () => {
    expect(faviconLinkTagsFromAppIcon("public/icon.svg")).toBe(
      '    <link rel="icon" href="./icon.svg" type="image/svg+xml" />\n    <link rel="apple-touch-icon" href="./icon.svg" />\n',
    );
  });

  it("no type for png under public/", () => {
    expect(faviconLinkTagsFromAppIcon("public/favicon.png")).toBe(
      '    <link rel="icon" href="./favicon.png" />\n    <link rel="apple-touch-icon" href="./favicon.png" />\n',
    );
  });

  it("returns null for resources or missing path", () => {
    expect(faviconLinkTagsFromAppIcon(undefined)).toBeNull();
    expect(faviconLinkTagsFromAppIcon("resources/icon.png")).toBeNull();
  });
});
