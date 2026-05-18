import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Page } from "./page";

describe("Page", () => {
  it("default width and structure", () => {
    render(
      <Page data-testid="p">
        <span>content</span>
      </Page>,
    );
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/max-w-lg/);
    expect(el.className).toMatch(/flex-col/);
  });

  it("maxWidth full", () => {
    render(
      <Page maxWidth="full" data-testid="p">
        x
      </Page>,
    );
    expect(screen.getByTestId("p").className).toMatch(/max-w-none/);
  });
});
