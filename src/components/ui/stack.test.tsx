import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./stack";

describe("Stack", () => {
  it("default vertical flex", () => {
    render(
      <Stack data-testid="s">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const el = screen.getByTestId("s");
    expect(el.className).toMatch(/flex-col/);
    expect(el.className).toMatch(/flex/);
  });

  it("row direction", () => {
    render(
      <Stack direction="row" data-testid="s">
        x
      </Stack>,
    );
    expect(screen.getByTestId("s").className).toMatch(/flex-row/);
  });
});
