import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircleProgress } from "./circle-progress";

describe("CircleProgress", () => {
  it("progressbar role and aria values", () => {
    render(<CircleProgress value={35} max={100} aria-label="Loading" />);
    const el = screen.getByRole("progressbar", { name: "Loading" });
    expect(el).toHaveAttribute("aria-valuenow", "35");
    expect(el).toHaveAttribute("aria-valuemax", "100");
    expect(el).toHaveAttribute("aria-valuetext", "35%");
  });

  it("indeterminate modda aria-valuenow olmaz, aria-busy", () => {
    render(<CircleProgress indeterminate aria-label="Processing" />);
    const el = screen.getByRole("progressbar", { name: "Processing" });
    expect(el).not.toHaveAttribute("aria-valuenow");
    expect(el).toHaveAttribute("aria-busy", "true");
  });

  it("showValueLabel shows percent in center", () => {
    render(<CircleProgress value={50} showValueLabel data-testid="cp" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
