import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Fab } from "./fab";

describe("Fab", () => {
  it("root and button", () => {
    render(<Fab aria-label="Ekle">+</Fab>);
    expect(document.querySelector("[data-fab-root]")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ekle" })).toBeInTheDocument();
  });

  it("bottomNavigation clearance class", () => {
    const { container } = render(
      <Fab aria-label="x" clearance="bottomNavigation">
        +
      </Fab>,
    );
    const root = container.querySelector("[data-fab-root]");
    expect(root?.className).toMatch(/pb-\[calc/);
  });
});
