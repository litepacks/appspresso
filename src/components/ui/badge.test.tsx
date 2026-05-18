import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("content and default classes", () => {
    render(<Badge>New</Badge>);
    const el = screen.getByText("New");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toMatch(/rounded-full/);
    expect(el.className).toMatch(/bg-primary/);
  });

  it("outline variant", () => {
    render(<Badge variant="outline">3</Badge>);
    expect(screen.getByText("3").className).toMatch(/border-border/);
  });
});
