import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("pulse and muted classes", () => {
    render(<Skeleton data-testid="sk" className="h-8 w-32" />);
    const el = screen.getByTestId("sk");
    expect(el.className).toMatch(/animate-pulse/);
    expect(el.className).toMatch(/bg-muted/);
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
